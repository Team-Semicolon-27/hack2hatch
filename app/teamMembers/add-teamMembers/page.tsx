
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { SearchX, UserPlus } from 'lucide-react';


export default function AddTeamMembers() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    

    // Search users
    const searchUsers = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/search?query=${query}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = async (userId: string) => {
        try {
            const notionId = searchParams.get('id');
            if (!notionId) {
                console.error('Notion ID is missing');
                return;
            }

            const response = await fetch('/api/notions/add-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notionId,
                    userId
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add team member');
            }

            if (response.ok) {
                router.refresh();
                router.back();
            }
        } catch (error) {
            console.error('Error adding team member:', error);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Add Team Members</h1>
            
            <div className="relative mb-6">
                <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                    }}
                    className="w-full"
                />
            </div>

            <div className="space-y-4">
                {isLoading && <p className="text-center">Searching...</p>}
                
                {!isLoading && searchResults.length === 0 && searchQuery && (
                    <div className="text-center text-gray-500 flex flex-col items-center">
                        <SearchX className="h-12 w-12 mb-2" />
                        <p>No users found</p>
                    </div>
                )}

                {searchResults.map((user: any) => (
                    <div
                        key={user._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Button
                            onClick={() => addMember(user._id)}
                            variant="outline"
                            size="sm"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}