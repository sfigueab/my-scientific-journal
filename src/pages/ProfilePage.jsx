import React from "react";


export default function ProfilePage({ userName }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Profile</h1>
      <p className="text-gray-700">
        {userName
          ? `Welcome, ${userName}. This is your profile page.`
          : "You are signed in anonymously."}
      </p>
    </div>
  );
}
