import React from 'react';
import { Users, UserPlus, Utensils, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create Your Circle',
      description:
        'Set up a permanent circle for your hostel floor, project group, branch mates, or club with your college name and meal budget.',
      icon: Users,
      badge: 'Admin Flow',
    },
    {
      step: '02',
      title: 'Invite Friends with a Link',
      description:
        'Share your 6-letter invite code or unique link on WhatsApp. Mates join instantly without complex student verification.',
      icon: UserPlus,
      badge: 'Zero Friction',
    },
    {
      step: '03',
      title: 'Add Food Individually',
      description:
        'When an order session opens, everyone picks their own dishes, dietary preferences, and notes. The cart updates in real-time.',
      icon: Utensils,
      badge: 'Real-Time Sync',
    },
    {
      step: '04',
      title: 'Lock & Finalize Together',
      description:
        'Admin locks the cart when the timer ends. Bills are itemized automatically down to the paise, and one delivery arrives at your hostel.',
      icon: CheckCircle,
      badge: 'Save ₹₹₹',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-swiggy-orange">
            Simple 4-Step Flow
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            How Campus Circles Works
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base">
            No more chasing people for payment, deciphering messy WhatsApp messages, or paying 4 separate delivery fees.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-3xl bg-[#FAFAF8] border border-charcoal-200/80 p-6 flex flex-col justify-between hover:border-orange-300 hover:shadow-card transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-charcoal-300 group-hover:text-swiggy-orange transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-charcoal-200 text-charcoal-700">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-swiggy-light flex items-center justify-center text-swiggy-orange mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-extrabold text-base text-charcoal-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-200/50 flex items-center gap-1.5 text-xs font-semibold text-swiggy-orange">
                  <span>Step {index + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
