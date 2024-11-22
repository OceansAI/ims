import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NonExistentUserModal({ 
  isOpen, 
  onClose, 
  onSignUp 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[400px] p-0 border-0">
        {/* Outer container with glow effect */}
        <div className="relative w-full">
          {/* Glow effect */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-[2px] bg-gradient-to-r from-blue-400/25 to-blue-600/25 blur-2xl rounded-3xl"></div>
          </div>

          {/* Main content with glass effect */}
          <div className="relative bg-white/90 dark:bg-gray-800/90 shadow-lg rounded-xl ring-1 ring-black/5 dark:ring-white/10 p-6 backdrop-blur-sm">
            <DialogHeader className="relative">
              <DialogTitle className="text-xl font-semibold text-center mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                  Account Not Found
                </span>
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We couldn't find an account with this email address. Would you like to create a new account?
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center space-x-3 pt-6">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="min-w-[100px] bg-white/80 hover:bg-gray-50/90 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 border-gray-200/80 dark:border-gray-600/80 text-gray-700 dark:text-gray-300 backdrop-blur-sm transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={onSignUp}
                className="min-w-[100px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Sign Up
              </Button>
            </div>

            {/* Subtle decorative elements */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/5 to-blue-600/5 dark:from-blue-400/3 dark:to-blue-600/3" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}