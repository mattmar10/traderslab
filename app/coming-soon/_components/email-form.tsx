import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";


type EmailFormProps = {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    handleSubmit: (e: React.FormEvent) => void;
};

export function EmailForm({ email, setEmail, isLoading, handleSubmit }: EmailFormProps) {
    return (
        <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-md mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
        >
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-grow"
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Subscribing...' : 'Notify Me'}
                </Button>
            </div>
        </motion.form>
    );
}
