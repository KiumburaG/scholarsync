'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CREATE_ACTIVITY_MUTATION, DELETE_ACTIVITY_MUTATION } from '@/lib/graphql/mutations';
import { MY_ACTIVITIES_QUERY } from '@/lib/graphql/queries';
import { OnboardingData } from '../onboarding-wizard';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExperiencesStep({ data, updateData, onNext, onBack }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [type, setType] = useState('leadership');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState('');

  const { data: activitiesData, refetch } = useQuery(MY_ACTIVITIES_QUERY);

  const [createActivity, { loading: creating }] = useMutation(CREATE_ACTIVITY_MUTATION, {
    onCompleted: () => {
      refetch();
      setShowAddForm(false);
      resetForm();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [deleteActivity] = useMutation(DELETE_ACTIVITY_MUTATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setType('leadership');
    setOrganization('');
    setRole('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setHoursPerWeek('');
  };

  const handleAddActivity = () => {
    setError('');

    if (!organization || !role) {
      setError('Organization and role are required');
      return;
    }

    createActivity({
      variables: {
        input: {
          type,
          organization,
          role,
          description: description || undefined,
          startDate: startDate || undefined,
          endDate: !isCurrent && endDate ? endDate : undefined,
          isCurrent,
          hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : undefined,
        },
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteActivity({ variables: { id } });
  };

  const activities = activitiesData?.myActivities || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Add 2-3 key activities to strengthen your profile. You can add more later.
        </p>

        {/* Activity List */}
        {activities.length > 0 && (
          <div className="space-y-3 mb-4">
            {activities.map((activity: any) => (
              <Card key={activity.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {activity.type}
                      </span>
                      {activity.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold">{activity.role}</h4>
                    <p className="text-sm text-gray-600">{activity.organization}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Activity Button */}
        {!showAddForm && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            + Add Activity
          </Button>
        )}

        {/* Add Activity Form */}
        {showAddForm && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="work">Work Experience</SelectItem>
                  <SelectItem value="volunteer">Volunteer Work</SelectItem>
                  <SelectItem value="award">Award/Honor</SelectItem>
                  <SelectItem value="skill">Skill/Certification</SelectItem>
                  <SelectItem value="extracurricular">Extracurricular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Computer Science Club"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role/Position *</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="President"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your role and impact..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
              />
              <Label htmlFor="isCurrent" className="font-normal">
                I currently hold this position
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Hours per Week</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                placeholder="10"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddActivity}
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Adding...' : 'Add Activity'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Your Story
        </Button>
      </div>
    </div>
  );
}
