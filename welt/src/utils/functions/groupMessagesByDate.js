const groupMessagesByDate = (messages) => {
    if (!messages) return [];

    const groupedMessages = messages.reduce((acc, message) => {
        const date = new Date(`${message.sent_at}Z`).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(message);

        return acc;
    }, {});

    return Object.entries(groupedMessages).map(([date, messages]) => ({ date, messages }));
};

export default groupMessagesByDate