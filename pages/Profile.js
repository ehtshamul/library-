import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      <div className="glass-card p-6">
        {user ? (
          <div className="text-gray-200 space-y-2">
            <div><span className="text-white font-semibold">Name:</span> {user.name}</div>
            <div><span className="text-white font-semibold">Email:</span> {user.email}</div>
          </div>
        ) : (
          <p className="text-gray-200">No user information available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;