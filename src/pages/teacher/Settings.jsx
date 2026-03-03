import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AccountSettings from '../shared/AccountSettings';

const Settings = () => {
    return (
        <DashboardLayout userType="teacher" title="Settings">
            <AccountSettings />
        </DashboardLayout>
    );
};

export default Settings;
