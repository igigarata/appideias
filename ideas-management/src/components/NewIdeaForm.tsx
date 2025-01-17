import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/Button';

const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  attachments: z.array(z.instanceof(File)).optional(),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

interface NewIdeaFormProps {
  onSubmit: (data: IdeaFormData) => Promise<void>;
  isLoading: boolean;
}

export function NewIdeaForm({ onSubmit, isLoading }: NewIdeaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  });

  const onSubmitForm = async (data: IdeaFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          {...register('category')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select a category</option>
          <option value="process-improvement">Process Improvement</option>
          <option value="product-feature">Product Feature</option>
          <option value="employee-experience">Employee Experience</option>
          <option value="customer-experience">Customer Experience</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
          Attachments
        </label>
        <input
          type="file"
          id="attachments"
          multiple
          {...register('attachments')}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Submit Idea
      </Button>
    </form>
  );
}
