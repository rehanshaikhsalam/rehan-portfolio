import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, Mail, MessageSquare } from 'lucide-react';
import ContactButton from './ContactButton';
import {
  ContactDraft,
  DEFAULT_CONTACT_DRAFT,
  loadResumeState,
  patchResumeState,
  subscribeResumeSync,
} from '../utils/resumeState';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<ContactDraft>(() => loadResumeState().contactDraft);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => loadResumeState().contactSubmitted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimerRef = useRef<number>(0);

  useEffect(() => {
    const unsub = subscribeResumeSync((state) => {
      setFormData(state.contactDraft);
      setIsSubmitted(state.contactSubmitted);
    });
    return () => {
      unsub();
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const updateDraft = (patch: Partial<ContactDraft>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      patchResumeState({ contactDraft: next });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current);
    submitTimerRef.current = window.setTimeout(() => {
      submitTimerRef.current = 0;
      setIsSubmitting(false);
      setIsSubmitted(true);
      patchResumeState({ contactSubmitted: true });
    }, 600);
  };

  const handleReset = () => {
    const clean = { ...DEFAULT_CONTACT_DRAFT };
    setIsSubmitted(false);
    setFormData(clean);
    patchResumeState({ contactDraft: clean, contactSubmitted: false });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-[32px] sm:rounded-[40px] border-2 border-[#D7E2EA]/30 bg-[#0C0C0C] p-6 sm:p-8 md:p-10 shadow-2xl text-[#D7E2EA] z-10 my-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-3">
                  Message Sent!
                </h3>
                <p className="text-[#D7E2EA]/70 text-sm sm:text-base max-w-md mx-auto mb-8 font-light">
                  Thanks for reaching out, {formData.name || 'friend'}! Rehan will review your automation brief and get back to you within 24 hours.
                </p>
                <ContactButton label="Done" onClick={handleReset} />
              </motion.div>
            ) : (
              <div>
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
                    <Sparkles className="w-4 h-4" /> Let&apos;s Build Something Useful
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight hero-heading">
                    Start a Project
                  </h2>
                  <p className="text-xs sm:text-sm text-[#D7E2EA]/60 font-light mt-1">
                    Interested in Make.com automation, Gemini AI workflows, or business process automation? Drop the details below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#D7E2EA]/80 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateDraft({ name: e.target.value })}
                        placeholder="Your name"
                        className="w-full bg-[#161616] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#D7E2EA]/80 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateDraft({ email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full bg-[#161616] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#D7E2EA]/80 mb-1.5">
                        Interested Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => updateDraft({ service: e.target.value })}
                        className="w-full bg-[#161616] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#D7E2EA] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors cursor-pointer"
                      >
                        <option value="Make.com Workflow Automation">01 - Make.com Automation</option>
                        <option value="AI-Powered Workflows">02 - AI Workflows (Gemini)</option>
                        <option value="Lead & Email Automation">03 - Lead & Email Ops</option>
                        <option value="Webhooks & Integrations">04 - Webhooks & Integrations</option>
                        <option value="AI Voice Automation">05 - AI Voice Automation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#D7E2EA]/80 mb-1.5">
                        Engagement Type
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => updateDraft({ budget: e.target.value })}
                        className="w-full bg-[#161616] border border-[#D7E2EA]/20 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#D7E2EA] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors cursor-pointer"
                      >
                        <option value="Internship / Part-Time">Internship / Part-Time</option>
                        <option value="Freelance Project">Freelance Project</option>
                        <option value="Ongoing Automation Support">Ongoing Support</option>
                        <option value="Workflow Consultation">Workflow Consultation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#D7E2EA]/80 mb-1.5">
                      Project Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => updateDraft({ message: e.target.value })}
                      placeholder="Tell me about the repetitive workflow or tools you want to automate..."
                      className="w-full bg-[#161616] border border-[#D7E2EA]/20 rounded-xl px-4 py-3 text-sm text-[#D7E2EA] placeholder:text-[#D7E2EA]/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#D7E2EA]/60">
                      <a
                        href="mailto:rehanshaikhsalam@gmail.com"
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> rehanshaikhsalam@gmail.com
                      </a>
                      <span className="text-white/20">•</span>
                      <a
                        href="https://wa.me/919014700399?text=Hi%20Rehan%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20an%20AI%20automation%20project."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                    <ContactButton
                      type="submit"
                      disabled={isSubmitting}
                      label={isSubmitting ? 'Sending...' : 'Send Message'}
                      className="w-full sm:w-auto"
                    />
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
