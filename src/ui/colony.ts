/**
 * Canvas renderer for the colony.
 *
 * Energy is a magnitude, so it is encoded on the sequential blue ramp rather
 * than on a rainbow. Starvation is a *state*, not a magnitude, so it gets the
 * reserved critical status colour as a ring — colour never carries it alone,
 * the ring itself is the second channel.
 */

import type { Bacterium, Utterance } from '../core/types.js';
import type { World } from '../core/world.js';

interface Bubble {
  text: string;
  until: number;
}

export class ColonyView {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly bubbles = new Map<string, Bubble>();
  selectedId: string | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: World,
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D canvas context unavailable');
    this.ctx = context;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /** Keeps the backing store in step with the CSS size and device pixel ratio. */
  resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = this.world.config;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.aspectRatio = `${width} / ${height}`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** Maps a click in CSS pixels to the nearest agent, or null. */
  pick(clientX: number, clientY: number): Bacterium | null {
    const rect = this.canvas.getBoundingClientRect();
    const scale = this.world.config.width / rect.width;
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    let best: Bacterium | null = null;
    let bestDistance = 26 * 26;
    for (const agent of this.world.bacteria) {
      const distance = (agent.x - x) ** 2 + (agent.y - y) ** 2;
      if (distance < bestDistance) {
        best = agent;
        bestDistance = distance;
      }
    }
    return best;
  }

  /**
   * At ~50 agents every bubble on screen at once is an unreadable mat, so only
   * the most recent few are drawn. The transcript panel keeps the full record.
   */
  static readonly MAX_BUBBLES = 5;

  say(utterance: Utterance): void {
    this.bubbles.delete(utterance.speakerId);
    this.bubbles.set(utterance.speakerId, {
      text: utterance.text,
      until: this.world.time + 2.6,
    });
    while (this.bubbles.size > ColonyView.MAX_BUBBLES) {
      const oldest = this.bubbles.keys().next().value;
      if (oldest === undefined) break;
      this.bubbles.delete(oldest);
    }
  }

  private energyColor(agent: Bacterium): string {
    const style = getComputedStyle(document.documentElement);
    const ramp = ['--seq-100', '--seq-250', '--seq-400', '--seq-550', '--seq-700'];
    // Normalised against the division threshold rather than the hard cap:
    // agents live between roughly 0.2 and 1.5, so scaling by the 2.2 ceiling
    // squeezed the whole colony into the two palest steps.
    const fraction = Math.min(
      1,
      Math.max(0, agent.energy / this.world.config.reproductionThreshold),
    );
    const index = Math.min(ramp.length - 1, Math.floor(fraction * ramp.length));
    return style.getPropertyValue(ramp[index]).trim();
  }

  render(): void {
    const { ctx } = this;
    const style = getComputedStyle(document.documentElement);
    const { width, height } = this.world.config;
    ctx.clearRect(0, 0, width, height);

    // Faint links between agents that understand each other well.
    ctx.lineWidth = 1;
    for (const agent of this.world.bacteria) {
      for (const [peerId, bond] of agent.bonds) {
        if (bond < 0.55 || peerId <= agent.id) continue;
        const peer = this.world.find(peerId);
        if (!peer) continue;
        const distance = Math.hypot(peer.x - agent.x, peer.y - agent.y);
        if (distance > this.world.config.hearingRadius) continue;
        ctx.strokeStyle = style.getPropertyValue('--grid').trim();
        ctx.globalAlpha = (bond - 0.55) * 1.6;
        ctx.beginPath();
        ctx.moveTo(agent.x, agent.y);
        ctx.lineTo(peer.x, peer.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    for (const agent of this.world.bacteria) {
      const radius = 4 + Math.min(5, agent.vocabulary.size() / 9);

      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.energyColor(agent);
      ctx.fill();

      // Starving: reserved critical colour, and a ring so it is not colour-alone.
      if (agent.energy < 0.3) {
        ctx.strokeStyle = style.getPropertyValue('--status-critical').trim();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (agent.id === this.selectedId) {
        ctx.strokeStyle = style.getPropertyValue('--series-2').trim();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    this.drawBubbles(style);
  }

  private drawBubbles(style: CSSStyleDeclaration): void {
    const { ctx } = this;
    ctx.font = '12px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    for (const [id, bubble] of this.bubbles) {
      if (bubble.until < this.world.time) {
        this.bubbles.delete(id);
        continue;
      }
      const agent = this.world.find(id);
      if (!agent) {
        this.bubbles.delete(id);
        continue;
      }

      const paddingX = 7;
      const textWidth = ctx.measureText(bubble.text).width;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 20;
      const x = Math.min(
        this.world.config.width - boxWidth - 4,
        Math.max(4, agent.x - boxWidth / 2),
      );
      const y = Math.max(4, agent.y - 26);

      ctx.globalAlpha = Math.min(1, (bubble.until - this.world.time) / 0.8);
      ctx.fillStyle = style.getPropertyValue('--surface-1').trim();
      ctx.strokeStyle = style.getPropertyValue('--axis').trim();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, boxWidth, boxHeight, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = style.getPropertyValue('--text-primary').trim();
      ctx.fillText(bubble.text, x + paddingX, y + boxHeight / 2);
      ctx.globalAlpha = 1;
    }
  }
}
