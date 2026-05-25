import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info } from 'lucide-react';
import { useAppSelector } from '../../app/store';
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
  dueDate: z.string().optional(),
});

type IssueFormValues = {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity: 'Minor' | 'Major' | 'Critical';
  assignedTo: string;
  dueDate: string;
};

interface IssueFormProps {
  initialValues?: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    severity: 'Minor' | 'Major' | 'Critical';
    assignedTo?: string;
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
  const { role } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  const [form, setForm] = useState<IssueFormValues>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    priority: initialValues?.priority || 'Medium',
    severity: initialValues?.severity || 'Minor',
    assignedTo: initialValues?.assignedTo || '',
    dueDate: initialValues?.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Clean form pre-populations if initialValues arrive asynchronously
  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        description: initialValues.description || '',
        priority: initialValues.priority || 'Medium',
        severity: initialValues.severity || 'Minor',
        assignedTo: initialValues.assignedTo || '',
        dueDate: initialValues.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialValues]);

  // admin only: Fetch users for the assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
    enabled: isAdmin,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const usersList = usersData?.users || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
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
    setSubmitted(true);

    const formDataToValidate = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      severity: form.severity,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate,
    };

    const result = issueFormSchema.safeParse(formDataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          const fieldName = err.path[0] as string;
          fieldErrors[fieldName] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please review the form and correct validation errors.');
      return;
    }

    onSubmit(formDataToValidate);
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

  const descLen = form.description.length;
  const descValid = descLen >= 10;

  return (
    <form onSubmit={handleSubmit} className="text-left bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <p className="text-xs text-gray-500 dark:text-gray-450">
            Fields marked with <span className="text-red-500 font-bold">*</span> are required
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Title */}
        <Input
          label="Issue Title *"
          name="title"
          id="title"
          placeholder="e.g. Login page crashes on submit"
          value={form.title}
          onChange={handleChange}
          error={(touched.title || submitted) ? errors.title : undefined}
          disabled={isLoading}
        />

        {/* Description */}
        <div>
          <Textarea
            label="Description *"
            name="description"
            id="description"
            placeholder="Describe the issue, steps to reproduce, expected vs actual behavior..."
            value={form.description}
            onChange={handleChange}
            error={(touched.description || submitted) ? errors.description : undefined}
            disabled={isLoading}
            rows={5}
          />
          {touched.description && (
            <div className="flex items-center justify-between mt-1.5">
              <p className={`text-xs font-medium flex items-center gap-1 ${
                !descValid
                  ? 'text-red-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {!descValid && <AlertTriangle className="h-3 w-3" />}
                {!descValid
                  ? `${10 - descLen} more character${10 - descLen !== 1 ? 's' : ''} needed`
                  : `${descLen} characters`}
              </p>
            </div>
          )}
        </div>

        {/* Priority & Severity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* Assignee & Due Date row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isAdmin && (
            <Select
              label="Assign To"
              name="assignedTo"
              id="assignedTo"
              options={userOptions}
              value={form.assignedTo}
              onChange={handleChange}
              error={errors.assignedTo}
              disabled={isLoading}
            />
          )}

          <Input
            label="Due Date"
            type="date"
            name="dueDate"
            id="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex items-center justify-end gap-3">
        <Button variant="primary" type="submit" isLoading={isLoading} className="px-6">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default IssueForm;
