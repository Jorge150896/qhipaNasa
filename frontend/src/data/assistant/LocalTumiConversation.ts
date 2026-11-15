import type { TumiConversation } from '@/domain/assistant/TumiConversation';
import { detectTextEmotion, emotionalAcknowledgement } from '@/domain/assistant/detectTextEmotion';

/** Local navigation guide, not a language model or a medical advisor. */
export class LocalTumiConversation implements TumiConversation {
  async reply(message: string, signal: AbortSignal): Promise<string> {
    signal.throwIfAborted();
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException('Cancelado', 'AbortError'));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', abort);
        resolve();
      }, 550);
      signal.addEventListener('abort', abort, { once: true });
    });
    signal.throwIfAborted();
    const text = message.toLocaleLowerCase('es');
    const acknowledgement = emotionalAcknowledgement(detectTextEmotion(message));
    const asksForGuide =
      /mapa|tierra|despegue|nasa|marte|luna|nave|explor|salud|pulso|sensor|tripula|chequeo/.test(
        text,
      );
    if (acknowledgement && !asksForGuide) return acknowledgement;
    if (/hola|gracias|tumi/.test(text))
      return '¡Qué alegría acompañarte! Puedo orientarte sobre el mapa espacial, la Tierra, la tripulación y el chequeo diario. ¿Qué quieres explorar?';
    if (/tierra|despegue|estaci[oó]n|nasa/.test(text))
      return 'En el mapa espacial selecciona Tierra y «Ver todo de la Tierra». Encontrarás lugares, sus fichas y videos históricos relacionados. Las sedes NASA no son todas estaciones de lanzamiento.';
    if (/mapa|marte|luna|nave|explor/.test(text))
      return 'Abre Mapa espacial para explorar los destinos. Selecciona un cuerpo para ver su ficha y sus opciones. Las órbitas y tamaños de la escena son ilustrativos.';
    if (/salud|pulso|sensor|tripula|chequeo/.test(text))
      return 'Tripulación reúne los sistemas y sus lecturas de demostración. Chequeo diario permite registrar tu autoevaluación. Para explicar una lectura concreta, usa el chat de misión; los datos de esta web son sintéticos y no ofrecen diagnóstico.';
    if (/qu[eé].*puedes|ayuda|funciona/.test(text))
      return 'Soy una guía local: puedo explicar cómo encontrar el mapa, la Tierra, Tripulación y Chequeo diario. Puedes pausarme, arrastrarme a un espacio libre u ocultarme. Todavía no tengo un modelo de IA conectado.';
    return 'Aún no tengo una IA conectada para responder preguntas abiertas. Puedo ayudarte a encontrar el mapa, los lugares de la Tierra, Tripulación o Chequeo diario. ¿Cuál te interesa?';
  }
}
