import { useState } from 'react';
import { User, Trophy, Clock, Target, Star, Settings, Edit3, Camera } from 'lucide-react';
import { Button } from '../Components';
import { Input } from '../Components';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    username: 'chessMaster2024',
    email: 'john.doe@example.com',
    rating: 1847,
    country: 'United States'
  });

  const stats = [
    { label: 'Games Played', value: '1,247', icon: <Target className="w-5 h-5" /> },
    { label: 'Win Rate', value: '68%', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Best Rating', value: '1,923', icon: <Star className="w-5 h-5" /> },
    { label: 'Time Played', value: '342h', icon: <Clock className="w-5 h-5" /> }
  ];

  const recentGames = [
    { opponent: 'AlexChess99', result: 'Win', rating: '+12', time: '2 hours ago' },
    { opponent: 'QueenGambit', result: 'Loss', rating: '-8', time: '5 hours ago' },
    { opponent: 'KnightRider', result: 'Win', rating: '+15', time: '1 day ago' },
    { opponent: 'PawnStorm', result: 'Draw', rating: '+2', time: '2 days ago' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                <User className="w-16 h-16" />
              </div>
              <button className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Name"
                    minLength={2}
                    maxLength={50}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Username"
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {profileData.name}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                    @{profileData.username}
                  </p>
                </div>
              )}

              {/* Rating Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {profileData.rating} Rating
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSave}
                    text="Save Changes"
                  />
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditing(false)}
                    text="Cancel"
                  />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditing(true)}
                    text="Edit Profile"
                    icon={<Edit3 className="w-4 h-4" />}
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {}}
                    text="Settings"
                    icon={<Settings className="w-4 h-4" />}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats + Recent Games Full Width */}
        <div className="space-y-8">
          {/* Stats Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-amber-900/20 rounded-xl">
                  <div className="text-amber-600 dark:text-amber-400 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Games</h2>
            <div className="space-y-4">
              {recentGames.map((game, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                      {game.opponent[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        vs {game.opponent}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {game.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        game.result === 'Win'
                          ? 'text-green-600'
                          : game.result === 'Loss'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {game.result}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {game.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
