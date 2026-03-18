import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatDashboard from '../../components/chat/ChatDashboard';

const TeacherMessages = () => {
    return (
        <DashboardLayout userType="teacher" title="Private Doubts & Chat">
            <ChatDashboard userType="teacher" />
        </DashboardLayout>
    );
};

export default TeacherMessages;