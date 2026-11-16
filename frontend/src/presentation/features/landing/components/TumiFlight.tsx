import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useId } from 'react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';

export function TumiFlight({ motionActive }: { motionActive: boolean }) {
  const t = useTranslation();
  const id = useId();
  return (
    <div className="qhipa-flight">
      <div className="qhipa-flight-orbit" aria-hidden="true" />
      <div className="qhipa-flight-halo" aria-hidden="true" />
      <div className="qhipa-flight-shadow" aria-hidden="true" />
      <div className="qhipa-tumi-float">
        <TumiTechPortrait
          id={id}
          emotion="happy"
          motion="celebrate"
          paused={!motionActive}
          label={t('Nami sonríe mientras flota y levanta su casco')}
        />
      </div>
      <span className="qhipa-spark qhipa-spark-one" aria-hidden="true">
        ✦
      </span>
      <span className="qhipa-spark qhipa-spark-two" aria-hidden="true">
        ✧
      </span>
      <span className="qhipa-spark qhipa-spark-three" aria-hidden="true">
        ✦
      </span>
    </div>
  );
}
