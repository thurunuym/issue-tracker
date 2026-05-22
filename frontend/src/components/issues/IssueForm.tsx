import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import usersApi from '../../services/usersApi';
import toast from 'react-hot-toast';

// Define Zod frontend validation schema
const issueFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  severity: z.enum(['Minor', 'Major', 'Critical']),
  assignedTo: z.string().optional(),
  tags: z.string().optional(),
  dueDate: z.string().optional(),
});

type IssueFormValues = {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity: 'Minor' | 'Major' | 'Critical';
  assignedTo: string;
  tags: string;
  dueDate: string;
};

interface IssueFormProps {
  initialValues?: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    severity: 'Minor' | 'Major' | 'Critical';
    assignedTo?: string;
    tags?: string[];
    dueDate?: string;
  };
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Submit',
}) => {
  const [form, setForm] = useState<IssueFormValues>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    priority: initialValues?.priority || 'Medium',
    severity: initialValues?.severity || 'Minor',
    assignedTo: initialValues?.assignedTo || '',
    tags: initialValues?.tags?.join(', ') || '',
    dueDate: initialValues?.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clean form pre-populations if initialValues arrive asynchronously
  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        description: initialValues.description || '',
        priority: initialValues.priority || 'Medium',
        severity: initialValues.severity || 'Minor',
        assignedTo: initialValues.assignedTo || '',
        tags: initialValues.tags?.join(', ') || '',
        dueDate: initialValues.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialValues]);

  // Fetch users for the assignment drop-down using TanStack Query
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const usersList = usersData?.users || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when typing gets updated
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger frontend verification via Zod
    const result = issueFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please correct the validation errors first.');
      return;
    }

    onSubmit(form);
  };

  const userOptions = [
    { label: '-- Unassigned --', value: '' },
    ...usersList.map((u: any) => ({ label: `${u.name} (${u.email})`, value: u._id })),
  ];

  const priorityOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Critical', value: 'Critical' },
  ];

  const severityOptions = [
    { label: 'Minor', value: 'Minor' },
    { label: 'Major', value: 'Major' },
    { label: 'Critical', value: 'Critical' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5.5 text-left bg-white dark:bg-gray-901 p-6 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm max-w-2xl mx-auto">
      <Input
        label="Issue Title"
        name="title"
        id="title"
        placeholder="Enter a descriptive title..."
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        disabled={isLoading}
      />

      <Textarea
        label="Detailed Description"
        name="description"
        id="description"
        placeholder="Describe the issue, steps to reproduce, or notes..."
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        disabled={isLoading}
        rows={5}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
        <Select
          label="Priority Level"
          name="priority"
          id="priority"
          options={priorityOptions}
          value={form.priority}
          onChange={handleChange}
          error={errors.priority}
          disabled={isLoading}
        />

        <Select
          label="Severity Level"
          name="severity"
          id="severity"
          options={severityOptions}
          value={form.severity}
          onChange={handleChange}
          error={errors.severity}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
        <Select
          label="Assignee User"
          name="assignedTo"
          id="assignedTo"
          options={userOptions}
          value={form.assignedTo}
          onChange={handleChange}
          error={errors.assignedTo}
          disabled={isLoading}
        />

        <Input
          label="Target Due Date"
          type="date"
          name="dueDate"
          id="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          disabled={isLoading}
        />
      </div>

      <Input
        label="Tags (Comma separated)"
        name="tags"
        id="tags"
        placeholder="e.g. bug, production, ui, auth"
        value={form.tags}
        onChange={handleChange}
        error={errors.tags}
        disabled={isLoading}
      />

      <div className="flex items-center justify-end space-x-3 pt-3.5 border-t border-gray-150 dark:border-gray-800">
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default IssueForm;
