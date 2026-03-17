import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatDashboard from '../../components/chat/ChatDashboard';

const Messages = () => {
    return (
        <DashboardLayout userType="student" title="Private Doubts & Chat">
            <ChatDashboard userType="student" />
        </DashboardLayout>
    );
};

export default Messages;