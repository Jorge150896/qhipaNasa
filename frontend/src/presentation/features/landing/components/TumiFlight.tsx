import { publicAsset } from '@/presentation/shared/publicAsset';
import Image from 'next/image';
export function TumiFlight() {
  return (
    <div className="qhipa-flight" aria-label="Tumi espacial sobre un cohete">
      <div className="qhipa-flight-orbit" aria-hidden="true" />
      <div className="qhipa-flight-halo" aria-hidden="true" />
      <div className="qhipa-tumi-float">
        <Image
          src={publicAsset('/brand/tumi-rocket.png')}
          alt="Tumi dorado sonriente viajando sobre un cohete, con detalles turquesa y una estela naranja"
          width={1224}
          height={1285}
          sizes="(max-width: 600px) 90vw, (max-width: 900px) 65vw, 540px"
          preload
          className="qhipa-tumi-image"
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
      <div className="qhipa-flight-caption">
        <span /> Un pequeño paso hacia tu bienestar.
      </div>
    </div>
  );
}
