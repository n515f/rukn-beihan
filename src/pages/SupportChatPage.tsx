import { MessageSquare } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import { useLang } from '@/context/LangContext';

const SupportChatPage = () => {
  const { t } = useLang();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">{t('common.support')}</h1>
          <p className="text-muted-foreground">
            Our team is here to help you with any questions
          </p>
        </div>

        <ChatWindow />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Quick Response</h3>
            <p className="text-sm text-muted-foreground">
              Average response time: 5 minutes
            </p>
          </div>
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Expert Support</h3>
            <p className="text-sm text-muted-foreground">
              Trained professionals ready to help
            </p>
          </div>
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">24/7 Available</h3>
            <p className="text-sm text-muted-foreground">
              We're here whenever you need us
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChatPage;
