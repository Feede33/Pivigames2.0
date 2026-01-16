import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  gameId: number;
  t: any; // Traducciones
};

export default function CommentSection({ gameId, t }: Props) {
  const { user } = useAuth();

  return (
    <div className="mt-8 pt-8 border-t border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t.modal.comments}
        </h2>
        
        {!user ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center backdrop-blur-sm">
            <p className="text-gray-300 mb-4 text-lg">{t.modal.loginToComment}</p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2 transition-all duration-300 hover:scale-105"
            >
              {t.modal.loginToComment}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder={t.modal.writeComment}
                  className="min-h-[80px] bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  disabled
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <Button
                    variant="ghost"
                    disabled
                    className="text-gray-400"
                  >
                    {t.modal.postComment}
                  </Button>
                  <Button
                    disabled
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t.modal.postComment}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg">{t.modal.noComments}</p>
      </div>
    </div>
  );
}
