import {useLocation, useNavigate} from "react-router-dom";
import Dialogues from "../Dialogues.jsx";

export default function DialoguesOverview({ dialogues, dialoguesIsLoading, dialoguesError }) {
    const navigate = useNavigate();

    const handleDialogueClick = (chatId) => {
        navigate(`/chats/${chatId}`);
    };

    return (
        <Dialogues
            dialogues={dialogues}
            dialoguesIsLoading={dialoguesIsLoading}
            dialoguesError={dialoguesError}
            onDialogueClick={handleDialogueClick}
            showSearch={false}
        />
    );
}
