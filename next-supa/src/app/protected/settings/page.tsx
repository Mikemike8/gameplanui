"use client";
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  User,
  Bell,
  Palette,
  Shield,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Save,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading } = useUser();

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);

  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  const [showStatus, setShowStatus] = useState(true);

  const handleSaveProfile = () => {
    console.log("Saving profile...", { displayName, bio, location });
  };

  const handleSaveNotifications = () => {
    console.log("Saving notifications...");
  };

  const handleSaveAppearance = () => {
    console.log("Saving appearance...", { theme, language });
  };

  const handleSavePrivacy = () => {
    console.log("Saving privacy...", { profileVisibility, showEmail, showStatus });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account...");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  const userAvatar = user.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`;
  const userName = user.name || user.nickname || user.email?.split("@")[0] || "User";

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
  ];

  const visibilityOptions = [
    { value: "public", label: "Public - Anyone can see" },
    { value: "team", label: "Team Only" },
    { value: "private", label: "Private - Only you" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-600">Manage your profile information</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder={userName}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </button>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Bell className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Control how you receive notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Direct Messages</p>
                  <p className="text-sm text-gray-600">Get notified when someone messages you</p>
                </div>
                <input
                  type="checkbox"
                  checked={messageNotifications}
                  onChange={(e) => setMessageNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Mentions</p>
                  <p className="text-sm text-gray-600">Get notified when someone mentions you</p>
                </div>
                <input
                  type="checkbox"
                  checked={mentionNotifications}
                  onChange={(e) => setMentionNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
              </div>

              <button
                onClick={handleSaveNotifications}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </button>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Palette className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-600">Customize how the app looks</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          theme === option.value
                            ? "border-violet-600 bg-violet-50"
                            : "border-gray-200 hover:border-violet-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveAppearance}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Appearance
              </button>
            </div>
          </section>

          {/* Privacy & Security Section */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
                <p className="text-sm text-gray-600">Manage your privacy and security settings</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div className="space-y-2">
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Profile Visibility
                </label>
                <select
                  id="visibility"
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Show Email Address</p>
                    <p className="text-sm text-gray-600">Display your email on your profile</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Show Online Status</p>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStatus}
                    onChange={(e) => setShowStatus(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePrivacy}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-lg border border-red-300 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
                <p className="text-sm text-gray-600">Irreversible and destructive actions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}