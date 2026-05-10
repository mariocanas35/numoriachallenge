import { NumaAvatar, type NumaPose } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

interface Step {
  num: number;
  numColor: string;
  pose: NumaPose;
  titleKey: 'step1' | 'step2' | 'step3';
}

const steps: Step[] = [
  { num: 1, numColor: 'bg-numoria-blue', pose: 'wave', titleKey: 'step1' },
  { num: 2, numColor: 'bg-numoria-orange', pose: 'think', titleKey: 'step2' },
  { num: 3, numColor: 'bg-numoria-green', pose: 'celebrate', titleKey: 'step3' },
];

export async function HowItWorks() {
  const t = await getTranslations('landing.howItWorks');

  return (
    <section className="bg-white" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2
          id="how-it-works-heading"
          className="text-center font-display text-3xl font-bold text-numoria-ink sm:text-4xl"
        >
          {t('title')}
        </h2>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <article key={step.num} className="flex flex-col items-center text-center">
              {/* Número con Numa al fondo */}
              <div className="relative mb-6">
                <NumaAvatar pose={step.pose} size="xl" />
                <span
                  aria-hidden="true"
                  className={`absolute -top-2 -right-2 flex size-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-card ${step.numColor}`}
                >
                  {step.num}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-numoria-ink">
                {t(`${step.titleKey}.title`)}
              </h3>
              <p className="mt-2 max-w-xs text-numoria-mid">{t(`${step.titleKey}.description`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
