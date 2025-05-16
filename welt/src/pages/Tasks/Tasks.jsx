import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import styles from "./Tasks.module.scss";
import Toggle from "../../components/Toggle/Toggle.jsx";
import NavChain from "../../components/Navigation/NavChain/NavChain.jsx";
import {FaPlus} from "react-icons/fa6";
import useAuth from "../../utils/customHooks/useAuth.js";
import {useGetTasksByProjectQuery} from "../../store/services/welt.js";
import {useEffect, useState} from "react";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor, useDraggable, useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";

export default function Tasks() {
    const { isAuthorized, userProfile, isLoading, currentProject } = useAuth();
    const { data, isLoading: tasksIsLoading, error } = useGetTasksByProjectQuery(
        { projectId: currentProject?.id },
        { skip: !currentProject }
    );


    // Состояние для хранения данных
    const [tasksData, setTasksData] = useState([]);
    const [activeId, setActiveId] = useState(null); // ID активной задачи

    // Обновляем состояние при изменении данных из API
    useEffect(() => {
        if (data) {
            setTasksData(data);
        }
    }, [data]);

    // Инициализация сенсоров для Drag-and-Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Обработчик начала перетаскивания
    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id); // Сохраняем ID активной задачи
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null); // Сбрасываем ID активной задачи
            return;
        }

        console.log("Over object:", over); // Отладочная информация

        // Находим статус активной задачи
        const activeStatusId = findStatusIdByTaskId(active.id);
        if (!activeStatusId) {
            console.error(`Active task with id ${active.id} not found in tasksData`);
            setActiveId(null);
            return;
        }

        // Определяем статус целевой колонки
        let overStatusId;
        if (over.id) {
            // Проверяем, является ли over.id id задачи
            const isTaskId = tasksData.some((group) =>
                group.tasks.some((task) => task.id === over.id)
            );

            if (isTaskId) {
                // Если over.id является id задачи, находим её статус
                overStatusId = findStatusIdByTaskId(over.id);
            } else {
                // Если over.id является id статуса (колонки), используем его напрямую
                overStatusId = over.id;
            }
        } else if (over.data?.current?.droppableContainer?.id) {
            // Если колонка пустая, находим статус колонки по её ID
            const targetColumn = tasksData.find((group) =>
                group.status.id === over.data.current.droppableContainer.id
            );
            overStatusId = targetColumn?.status.id;
        } else {
            console.error("Unable to determine overStatusId. Over object:", over);
            setActiveId(null);
            return;
        }

        console.log(`old ${activeStatusId} new ${overStatusId}`);

        // Если задача перемещена в другую колонку
        if (activeStatusId !== overStatusId) {
            const activeTask = findTaskById(active.id);
            if (!activeTask) {
                console.error(`Active task with id ${active.id} not found in tasksData`);
                setActiveId(null);
                return;
            }

            const newStatusId = overStatusId;

            // Обновляем статус задачи на сервере
            updateTaskStatus(activeTask.id, newStatusId);

            // Обновляем состояние локально
            setTasksData((prevData) =>
                prevData.map((statusGroup) => {
                    if (statusGroup.status.id === activeTask.status.id) {
                        // Удаляем задачу из старой колонки
                        return {
                            ...statusGroup,
                            tasks: statusGroup.tasks.filter((task) => task.id !== activeTask.id),
                        };
                    }
                    if (statusGroup.status.id === newStatusId) {
                        // Добавляем задачу в новую колонку
                        return {
                            ...statusGroup,
                            tasks: [...statusGroup.tasks, { ...activeTask, status_id: newStatusId }],
                        };
                    }
                    return statusGroup;
                })
            );
        } else {
            // Если задача перемещена внутри одной колонки
            const oldIndex = tasksData
                .find((group) => group.status.id === activeStatusId)
                ?.tasks.findIndex((task) => task.id === active.id);
            const newIndex = tasksData
                .find((group) => group.status.id === activeStatusId)
                ?.tasks.findIndex((task) => task.id === over.id);

            if (oldIndex === undefined || newIndex === undefined) {
                console.error(`Unable to find indices for task movement in column with status id ${activeStatusId}`);
                setActiveId(null);
                return;
            }

            // Обновляем порядок задач только если индексы отличаются
            if (oldIndex !== newIndex) {
                setTasksData((prevData) =>
                    prevData.map((statusGroup) => {
                        if (statusGroup.status.id === activeStatusId) {
                            return {
                                ...statusGroup,
                                tasks: arrayMove(statusGroup.tasks, oldIndex, newIndex),
                            };
                        }
                        return statusGroup;
                    })
                );
            }
        }

        setActiveId(null); // Сбрасываем ID активной задачи
    };

// Вспомогательные функции
    const findTaskById = (taskId) => {
        for (const statusGroup of tasksData) {
            const task = statusGroup.tasks.find((task) => task.id === taskId);
            if (task) return { ...task, status: statusGroup.status };
        }
        console.error(`Task with id ${taskId} not found in tasksData`);
        return null;
    };

    const findStatusIdByTaskId = (taskId) => {
        for (const statusGroup of tasksData) {
            if (statusGroup.tasks.some((task) => task.id === taskId)) {
                return statusGroup.status.id;
            }
        }
        console.error(`Status for task with id ${taskId} not found in tasksData`);
        return null;
    };

    const updateTaskStatus = async (taskId, newStatusId) => {
        try {
            await fetch(`/api/tasks/${taskId}/update-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status_id: newStatusId }),
            });
        } catch (error) {
            console.error("Ошибка при обновлении статуса задачи:", error);
        }
    };

    if (tasksIsLoading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка загрузки задач</p>;

    return (
        <PageBuilder removeBg={true} withNav={false}>
            <div className={styles.headingSection}>
                <NavChain paths={[{ title: "DoWork", path: "" }, { title: "Задачи", path: "/requests" }]} />
                <h3>Задачи</h3>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <div className={styles.tasksColumns}>
                    {tasksData.map((statusGroup) => (
                        <Column
                            key={statusGroup.status.id}
                            statusGroup={statusGroup}
                            tasks={statusGroup.tasks}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeId ? (
                        <TaskCard task={findTaskById(activeId)} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </PageBuilder>
    );
}

function Column({ statusGroup, tasks }) {
    const { setNodeRef } = useDroppable({
        id: statusGroup.status.id,
    });

    return (
        <div ref={setNodeRef} className={styles.taskCol}>
            <div className={styles.taskHeader}>
                <div className={styles.circle} style={{ background: "var(--primary)" }} />
                <h6>{statusGroup.status.title}</h6>
                <p className="text-secondary">{tasks.length}</p>
                <button className={styles.roundButton}>
                    <FaPlus />
                </button>
            </div>
            <div className={styles.taskCol}>
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}

function TaskItem({ task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useDraggable({
            id: task.id,
        });

    const style = {
        transform: transform ? CSS.Transform?.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    );
}

function TaskCard({ task }) {
    return (
        <div className={styles.task}>
            <p>{task.title}</p>
        </div>
    );
}