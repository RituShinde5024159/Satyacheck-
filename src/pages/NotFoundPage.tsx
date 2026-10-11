import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E8ECE9] text-[#516260] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-[#202B2A]">
          Page or Report Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#516260] leading-relaxed">
          The requested verification record or URL path could not be located in the SatyaCheck registry.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
