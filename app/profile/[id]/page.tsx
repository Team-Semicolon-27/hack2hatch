'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from "axios";
import {useParams} from "next/navigation";

// Types for profile data
interface Notion {
  _id: string;
  title: string;
  logo?: string;
  description: string;
}

interface UserProfile {
  _id: string;
  username: string;
  name: string;
  profileImage?: string;
}

interface EntrepreneurProfile extends UserProfile {
  notionsOwnerOf: Notion[];
  notionsPartOf: Notion[];
  followers: UserProfile[];
  followings: UserProfile[];
  mentorFollowers: UserProfile[];
  mentorFollowings: UserProfile[];
  isFollowed: boolean;
}

interface MentorProfile extends UserProfile {
  notionsPartOf: Notion[];
  followers: UserProfile[];
  followings: UserProfile[];
  mentorFollowers: UserProfile[];
  mentorFollowings: UserProfile[];
  isFollowed: boolean;
}

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<EntrepreneurProfile | MentorProfile | null>(null);
  const [type, setType] = useState("")
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notions' | 'connections'>('notions');
  
  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`)
        
        if (res.status === 200) {
          setUser(res.data.user);
          setType(res.data.type);
        }
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  async function follow() {
    try {
      if (type === "entrepreneur") {
        if (!user?.isFollowed) {
          const res = await axios.patch(`/api/follow/${id}`)
          if (res.status === 200) {
            setUser(prev => (prev ? {...prev, isFollowed: !prev?.isFollowed} : null));
          } else {
            alert("failed to follow")
          }
        } else {
          const res = await axios.delete(`/api/follow/${id}`)
          if (res.status === 200) {
            setUser(prev => (prev ? {...prev, isFollowed: !prev?.isFollowed} : null));
          } else {
            alert("failed to unfollow")
          }
        }
      } else {
        if (!user?.isFollowed) {
          const res = await axios.patch(`/api/mentorFollow/${id}`)
          if (res.status === 200) {
            setUser(prev => (prev ? {...prev, isFollowed: !prev?.isFollowed} : null));
          } else {
            alert("failed to follow")
          }
        } else {
          const res = await axios.delete(`/api/mentorFollow/${id}`)
          if (res.status === 200) {
            setUser(prev => (prev ? {...prev, isFollowed: !prev?.isFollowed} : null));
          } else {
            alert("failed to unfollow")
          }
        }
      }
    } catch(error) {
      console.log(error);
    }
  }
  
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-orange-500 font-semibold text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 font-semibold text-xl">Error: {error}</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 font-semibold text-xl">Error: No profile data found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between bg-orange-500">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <span className="text-2xl">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-orange-100">@{user.username}</p>
                <p className="text-orange-100 text-sm mt-1 capitalize">{type}</p>
              </div>
            </div>
            <div>
              <button
                className={`px-4 py-2 rounded-md font-medium ${
                  user.isFollowed
                    ? "bg-gray-100 text-orange-500 hover:bg-gray-200"
                    : "bg-white text-orange-500 hover:bg-gray-100"
                }`}
                onClick={follow}
              >
                {user.isFollowed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('notions')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'notions'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notions
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'connections'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connections
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'notions' && (
              <div>
                {type === 'entrepreneur' && 'notionsOwnerOf' in user && user.notionsOwnerOf?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Owner of</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.notionsOwnerOf.map((notion) => (
                        <div key={notion._id} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <div className="flex items-center mb-2">
                              {notion.logo ? (
                                <img
                                  src={notion.logo}
                                  alt={notion.title}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 mr-3 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 mr-3 bg-orange-100 rounded flex items-center justify-center text-orange-500">
                                  <span className="text-lg">{notion.title?.charAt(0)?.toUpperCase() || 'N'}</span>
                                </div>
                              )}
                              <h4 className="font-semibold text-gray-800">{notion.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{notion.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Part of</h3>
                  {user.notionsPartOf?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.notionsPartOf.map((notion) => (
                        <div key={notion._id} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <div className="flex items-center mb-2">
                              {notion.logo ? (
                                <img
                                  src={notion.logo}
                                  alt={notion.title}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 mr-3 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 mr-3 bg-orange-100 rounded flex items-center justify-center text-orange-500">
                                  <span className="text-lg">{notion.title?.charAt(0)?.toUpperCase() || 'N'}</span>
                                </div>
                              )}
                              <h4 className="font-semibold text-gray-800">{notion.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{notion.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No notions found</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'connections' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Followers</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...user.followers || [], ...user.mentorFollowers || []].length > 0 ? (
                      [...user.followers || [], ...user.mentorFollowers || []].map((follower) => (
                        <Link
                          href={`/profile/${follower._id}`}
                          key={follower._id}
                          className="flex flex-col items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mb-2">
                            {follower.profileImage ? (
                              <img
                                src={follower.profileImage}
                                alt={follower.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
                                <span>{follower.name?.charAt(0)?.toUpperCase() || '?'}</span>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm text-center">{follower.name}</span>
                          <span className="text-gray-500 text-xs">@{follower.username}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-full text-gray-500 italic">No followers yet</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Following</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...user.followings || [], ...user.mentorFollowings || []].length > 0 ? (
                      [...user.followings || [], ...user.mentorFollowings || []].map((following) => (
                        <Link
                          href={`/profile/${following._id}`}
                          key={following._id}
                          className="flex flex-col items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mb-2">
                            {following.profileImage ? (
                              <img
                                src={following.profileImage}
                                alt={following.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
                                <span>{following.name?.charAt(0)?.toUpperCase() || '?'}</span>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm text-center">{following.name}</span>
                          <span className="text-gray-500 text-xs">@{following.username}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-full text-gray-500 italic">Not following anyone yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}