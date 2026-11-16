import type { TumiConversation, TumiReply } from '@/domain/assistant/TumiConversation';
import { detectTextEmotion, emotionalAcknowledgement } from '@/domain/assistant/detectTextEmotion';

/** Local navigation guide, not a language model or a medical advisor. */
export class LocalTumiConversation implements TumiConversation {
  async reply(message: string, signal: AbortSignal): Promise<TumiReply> {
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
    return { text: this.replyText(message) };
  }

  private replyText(message: string): string {
    const text = message.toLocaleLowerCase('es');
    const acknowledgement = emotionalAcknowledgement(detectTextEmotion(message));
    const asksForGuide =
      /mapa|tierra|despegue|nasa|marte|luna|nave|explor|salud|pulso|sensor|tripula|chequeo|monitoreo|health|pulse|crew|check.in|map|earth|launch|mars|moon|ship|health|pulse|crew|check.in/.test(
        text,
      );
    if (acknowledgement && !asksForGuide) return acknowledgement;
    if (/tierra|despegue|estaci[oó]n|nasa|earth|launch|station/.test(text))
      return 'Vamos a Tierra. Abre «Centros en Tierra» desde el mapa y elige el lugar que te dé curiosidad. Ahí puedes ver qué hace ese centro y explorar sus videos.';
    if (/mapa|marte|luna|nave|explor|map|mars|moon|ship/.test(text))
      return 'Abre Mapa espacial y elige el lugar que te dé curiosidad. Si tocas Marte, por ejemplo, podrás conocer la Base Ares y ver quién está allí.';
    if (/salud|pulso|sensor|tripula|chequeo|monitoreo|health|pulse|crew|check.in/.test(text))
      return 'Si quieres saber cómo va alguien, abre Tripulación, elige su nombre y miramos sus lecturas de la simulación. Si quieres contar cómo vas tú, empieza en Monitoreo diario.';
    if (/qu[eé].*puedes|ayuda|funciona|what can you|help|how does/.test(text))
      return 'Puedo acompañarte por el mapa, la tripulación o tu chequeo diario. ¿Por dónde empezamos?';
    if (
      /^[¡!.,\s]*(?:(?:hola|hello|hi)(?:\s+nami)?|(?:muchas\s+)?(?:gracias|thanks|thank you)(?:\s+nami)?|nami)[¡!.,\s]*$/.test(
        text,
      )
    )
      return '¡Qué alegría acompañarte! Puedo orientarte sobre el mapa espacial, la Tierra, la tripulación y el monitoreo diario. ¿Qué quieres explorar?';
    return 'No entendí bien tu pregunta. ¿Me la cuentas de otra forma y me dices qué pantalla, lectura o lugar te interesa?';
  }
}
