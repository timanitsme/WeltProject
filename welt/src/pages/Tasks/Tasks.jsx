import PageBuilder from "../../components/PageBuilder/PageBuilder.jsx";
import styles from "./Tasks.module.scss";
import Toggle from "../../components/Toggle/Toggle.jsx";
import NavChain from "../../components/Navigation/NavChain/NavChain.jsx";
import {FaPlus} from "react-icons/fa6";
import useAuth from "../../utils/customHooks/useAuth.js";
import {useGetTasksByProjectQuery, useUpdateTaskStatusMutation} from "../../store/services/welt.js";
import {useEffect, useState} from "react";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor, MouseSensor,
    PointerSensor, pointerWithin, TouchSensor, useDraggable, useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import {Avatar, AvatarGroup, Tooltip} from "@mui/material";
import {useNavigate} from "react-router-dom";

function SortableTaskItem({ task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate?.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskItem task={task} />
        </div>
    );
}

const statusColors = {
    "Бэклог": "#F0F0F0",
    "К выполнению": "#4A90E2",
    "В процессе": "#FFA726",
    "Завершено": "#66BB6A"
}

function StatusColumn({ statusGroup }) {
    const navigate = useNavigate()
    const { setNodeRef } = useDroppable({
        id: statusGroup.status.id,
        data: {
            type: 'column',
            status: statusGroup.status
        }
    });
    return (
        <div ref={setNodeRef} className={styles.taskCol}>
            <div className={styles.taskHeader}>
                <div className={styles.circle}  style={{ background: `${statusColors[statusGroup.status.title] || "var(--primary)"}` }} />
                <h6>{statusGroup.status.title}</h6>
                <p className="text-secondary">{statusGroup.tasks.length}</p>
                <button className={styles.roundButton} onClick={() => navigate(`/tasks/add/${statusGroup.status.id}`)}>
                    <FaPlus />
                </button>
            </div>
            <div className={styles.taskColContent}>
                <SortableContext items={statusGroup.tasks.map(t => t.id)}>
                    {statusGroup.tasks.map(task => (
                        <SortableTaskItem
                            key={task.id}
                            task={task}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}


export default function Tasks() {
    const { currentProject } = useAuth();
    const { data: fetchedData = [], isLoading: tasksIsLoading } = useGetTasksByProjectQuery(
        { projectId: currentProject?.id },
        { skip: !currentProject }
    );
    const [statusGroups, setStatusGroups] = useState([]);
    const [updateTaskStatus] = useUpdateTaskStatusMutation();
    const [activeTask, setActiveTask] = useState(null);

    useEffect(() => {
        if (fetchedData.length > 0) {
            const transformedData = fetchedData.map(group => ({
                ...group,
                tasks: group.tasks.map(task => ({
                    ...task,
                    status: group.status
                }))
            }));
            setStatusGroups(transformedData);
        }
    }, [fetchedData]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!active || !over) return;

        const activeContainer = statusGroups.find(g =>
            g.tasks.some(t => t.id === active.id)
        );

        let overContainer;
        if (over.data.current?.type === 'column') {
            overContainer = statusGroups.find(g =>
                g.status.id === over.data.current.status.id
            );
        } else {
            overContainer = statusGroups.find(g =>
                g.tasks.some(t => t.id === over.id)
            );
        }

        if (!activeContainer || !overContainer) return;

        const activeTask = activeContainer.tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        if (activeContainer.status.id === overContainer.status.id) {
            const oldIndex = activeContainer.tasks.findIndex(t => t.id === active.id);
            const newIndex = overContainer.tasks.findIndex(t => t.id === over.id);

            if (oldIndex !== newIndex) {
                const newTasks = arrayMove(activeContainer.tasks, oldIndex, newIndex);

                const newStatusGroups = statusGroups.map(group =>
                    group.status.id === activeContainer.status.id
                        ? { ...group, tasks: newTasks }
                        : group
                );

                setStatusGroups(newStatusGroups);
            }
            return;
        }

        try {
            const newStatusGroups = statusGroups.map(group => {
                if (group.status.id === activeContainer.status.id) {
                    return {
                        ...group,
                        tasks: group.tasks.filter(t => t.id !== activeTask.id)
                    };
                }
                if (group.status.id === overContainer.status.id) {
                    return {
                        ...group,
                        tasks: [...group.tasks, {
                            ...activeTask,
                            status: overContainer.status
                        }]
                    };
                }
                return group;
            });

            setStatusGroups(newStatusGroups);

            await updateTaskStatus({
                task_id: activeTask.id,
                status_id: overContainer.status.id
            }).unwrap();

        } catch (error) {
            setStatusGroups(fetchedData);
            console.error('Failed to update task status:', error);
        }

        setActiveTask(null);
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 10 },
        }),
        useSensor(TouchSensor)
    );

    const handleDragStart = (event) => {
        const { active } = event;
        const task = statusGroups
            .flatMap(g => g.tasks)
            .find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    if (tasksIsLoading) return <div>Loading...</div>;

    return (
        <PageBuilder removeBg={true} withNav={false}>
            <div className={styles.headingSection}>
                <NavChain paths={[
                    { title: `${currentProject?.title}`, path: "" },
                    { title: "Задачи", path: "/requests" }
                ]} />
                <h3>Задачи</h3>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.tasksColumns}>
                    {statusGroups.map((statusGroup) => (
                        <StatusColumn key={statusGroup.status.id} statusGroup={statusGroup} />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskItem task={activeTask} style={{
                            transform: 'rotate(3deg)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            cursor: 'grabbing',
                        }} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </PageBuilder>
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

const priorityColors = {
    "Высокий": "#DC2626",
    "Средний": "#F59E0B",
    "Низкий": "#10B981"
}

function TaskCard({ task }) {
    const date = new Date(`${task.deadline}Z`);
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    let deadlineColor = "#10B981";
    if (diffDays <= 7 && diffDays > 3) {
        deadlineColor = "#F59E0B";
    } else if (diffDays <= 3) {
        deadlineColor = "#DC2626";
    }

    return (
        <div className={`${styles.task} noSelect`}>
            <div className={styles.gapLine}>
                <div className={styles.circle} style={{ background: `${priorityColors[task.priority.title] || "var(--primary)"}` }}></div>
                <p className="text-secondary">{task.priority.title}</p>
            </div>
            <p className="bold">{task.title}</p>

            <p><span className="text-secondary">Описание: </span>{task.description}</p>
            <p><span className="text-secondary">Выполнить до: </span><span style={{color: deadlineColor}}>{`${date.toLocaleDateString()} ${date.toLocaleTimeString('ru-RU', timeOptions)}`}</span></p>

            <div className={styles.assignees}>
                {task.assignees.length === 1 ? (
                    <Tooltip title={task.assignees[0].name}>
                        <Avatar
                            src={task.assignees[0].avatar}
                            alt={task.assignees[0].name}
                            sx={{ width: 32, height: 32 }}
                        />
                    </Tooltip>
                ) : (
                    <AvatarGroup max={3} spacing="small">
                        {task.assignees.map((assignee) => (
                            <Tooltip key={assignee.id} title={assignee.name} >
                                <Avatar
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    sx={{ width: 32, height: 32 }}
                                />
                            </Tooltip>
                        ))}
                    </AvatarGroup>
                )}
            </div>
        </div>
    );
}