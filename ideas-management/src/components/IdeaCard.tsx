import { format } from 'date-fns';
import { ThumbUpIcon, ThumbDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Idea } from '@/types';
import { Button } from './ui/Button';

interface IdeaCardProps {
  idea: Idea;
  onVote: (ideaId: string, type: 'up' | 'down') => void;
  onComment: (ideaId: string) => void;
}

export function IdeaCard({ idea, onVote, onComment }: IdeaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
          <p className="text-sm text-gray-500">
            by {idea.user.full_name} • {format(new Date(idea.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded',
            {
              'bg-yellow-100 text-yellow-800': idea.status === 'pending',
              'bg-green-100 text-green-800': idea.status === 'approved',
              'bg-red-100 text-red-800': idea.status === 'rejected',
              'bg-blue-100 text-blue-800': idea.status === 'implemented',
            }
          )}
        >
          {idea.status}
        </span>
      </div>
      
      <p className="mt-4 text-gray-600">{idea.description}</p>
      
      {idea.attachments.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Attachments:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {idea.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {attachment.file_name}
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(idea.id, 'up')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ThumbUpIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(idea.id, 'down')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ThumbDownIcon className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-600">{idea.votes} votes</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComment(idea.id)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
          <span>{idea.comments.length} comments</span>
        </Button>
      </div>
    </div>
  );
}
