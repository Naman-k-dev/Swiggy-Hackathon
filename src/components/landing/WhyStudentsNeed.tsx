import React from 'react';
import { MessageSquareOff, IndianRupee, Clock, Truck, Check, X } from 'lucide-react';

export function WhyStudentsNeed() {
  const comparisons = [
    {
      pain: 'Ordering via WhatsApp group texts',
      painSub: '20 messages back and forth just to decide who wants garlic naan or butter naan.',
      solution: 'Dedicated live group session',
      solutionSub: 'Everyone browses the menu and drops dishes directly into the shared circle cart.',
      icon: MessageSquareOff,
    },
    {
      pain: 'Awkward UPI payment collection',
      painSub: 'One person fronts ₹800 and spends the next 4 days reminding 3 friends to GPay their share.',
      solution: 'Automated paise-level individual split',
      solutionSub: 'Every member sees their exact individual subtotal plus fair share of fees or discounts.',
      icon: IndianRupee,
    },
    {
      pain: 'Multiple ₹40 delivery charges',
      painSub: 'Four students in adjacent hostel rooms paying ₹160 in separate delivery and handling fees.',
      solution: 'Single shared delivery to campus gate',
      solutionSub: 'Reach the ₹400 group cart threshold to waive delivery fees and pool restaurant promotions.',
      icon: Truck,
    },
    {
      pain: 'Missed orders when one person orders early',
      painSub: '"Wait, I was in the washroom, did you order already? Now I have to order alone."',
      solution: 'Synchronized session cutoff timer',
      solutionSub: 'Clear countdown tells everyone when the cart locks so nobody gets left behind.',
      icon: Clock,
    },
  ];

  return (
    <section className="py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-swiggy-orange">
            The Campus Reality
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Why Students Need Campus Circles
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base">
            Group ordering on campus shouldn&apos;t feel like a logistical nightmare. Here is how we turn chaos into a streamlined experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-3xl bg-white border border-charcoal-100 p-6 shadow-sm flex flex-col justify-between"
              >
                {/* Header Icon */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-charcoal-100 flex items-center justify-center text-charcoal-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wide">
                    Problem #{index + 1}
                  </span>
                </div>

                {/* Side-by-side or stacked Before vs After */}
                <div className="space-y-4">
                  {/* Before */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
                    <div className="mt-0.5 rounded-full p-1 bg-red-100 text-red-600 flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-950">{item.pain}</p>
                      <p className="text-[11px] text-red-800/80 mt-0.5">{item.painSub}</p>
                    </div>
                  </div>

                  {/* After with Campus Circles */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="mt-0.5 rounded-full p-1 bg-emerald-100 text-emerald-700 flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">{item.solution}</p>
                      <p className="text-[11px] text-emerald-800/80 mt-0.5">{item.solutionSub}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
