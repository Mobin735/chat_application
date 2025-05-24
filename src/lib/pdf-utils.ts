import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ChatMessage } from './types'
import { format } from 'date-fns'
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// ⚠️  called for every message
function md(text: string): string {
  const raw = marked.parse(text, { breaks: true, mangle:false, headerIds:false });
  return DOMPurify.sanitize(raw);
}

/******************************************************************************
 * HTML factory – produces ONE string that already contains:
 *   • structural markup that mirrors your React tree
 *   • a <style> block that emulates the important Tailwind / shadcn classes
 *   • all conversation bubbles, avatars, timestamps, document chips, etc.
 ******************************************************************************/
function pdfHTML(messages: ChatMessage[], pdfTitle: string): string {
  const rows = messages
    .map(m => {
      const isUser = m.sender === 'user';
      const avatar = isUser ? '👤' : '🤖';     
      const whoLbl = isUser ? 'You' : 'Assistant';
      const timeLbl = format(new Date(m.timestamp), 'p'); 

      return `
        <div class="row ${isUser ? 'right' : 'left'}">
          ${!isUser ? `<div class="avatar">${avatar}</div>` : ''}

          <div class="bubble ${isUser ? 'user' : 'bot'}">
            <div class="markdown">${md(m.text)}</div>

            ${m.document
          ? `<div class="attachment">
                     📎 ${m.document.name}
                     ${m.document.size && m.document.size > 0
            ? `(${(m.document.size / 1024).toFixed(2)} KB)`
            : ''
          }
                   </div>`
          : ''
        }

            <p class="stamp">${whoLbl} • ${timeLbl}</p>
          </div>

          ${isUser ? `<div class="avatar">${avatar}</div>` : ''}
        </div>`;
    })
    .join('');

  return `
    <style>
      body { margin:0 }
      .card {
        width: 900px;
        height: auto;                 /* will grow with content */
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        font-family: 'Inter', Arial, sans-serif;
        color: #111;
        background:#fff;
        border:1px solid rgba(0,0,0,.08);
        box-shadow: 0 3px 14px rgba(0,0,0,.12);
      }
      .card-header {
        display: flex;
        justify-content: center;
        align-items:   center;    
        min-height: 70px;
        padding: 0 20px;
        border-bottom: 1px solid rgba(0,0,0,.08);
        background: rgba(0,0,0,.04);
        font-size: 25px;
        font-weight: 600;
      }
      .scroll {
        padding: 24px;
      }
      .row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-bottom: 22px;
      }
      .row.left  { justify-content: flex-start }
      .row.right { justify-content: flex-end }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background:#008080;    
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        color:#fff;
        box-shadow: 0 1px 3px rgba(0,0,0,.15);
      }
      .bubble {
        max-width: 70%;
        padding: 14px 18px;
        border-radius: 16px;
        line-height: 1.45;
        box-shadow: 0 1px 4px rgba(0,0,0,.1);
      }
      .bubble.bot  { background:#f5f5f5; border:1px solid #e2e2e2; border-bottom-left-radius:0}
      .bubble.user { background:#3b82f6; color:#fff; border-bottom-right-radius:0 }
      .markdown { white-space: pre-wrap; font-size: 14px }
      .attachment {
        font-size: 12px;
        margin-top: 8px;
        padding-top: 6px;
        border-top:1px dashed rgba(0,0,0,.25);
        opacity:.85;
      }
      .stamp {
        font-size: 11px;
        opacity:.65;
        margin-top: 6px;
        text-align: right;
      }
      .markdown h1, .markdown h2, .markdown h3 { margin: 0 0 0.4em; font-weight: 600 }
      .markdown ul, .markdown ol { margin: 0.35em 0 0.35em 1.2em; padding:0 }
      .markdown code {
        font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace;
        background: rgba(0,0,0,.08);
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 90%;
      }
      .markdown pre > code {
        display: block;
        padding: 10px 12px;
        overflow-x: auto;
      }

    </style>

    <div class="card">
      <div class="card-header">${pdfTitle}</div>
      <div class="scroll">
        ${rows}
      </div>
    </div>`;
}


export async function generateChatPDF(
  messages: ChatMessage[],
  title: string
): Promise<Blob> {
  /* 1. mount hidden DOM */
  const holder = document.createElement('div');
  holder.innerHTML = pdfHTML(messages, title);   // ← contains <div class="wrapper"><div class="card">
  document.body.appendChild(holder);

  /* 2. snapshot ONLY the card (no extra viewport width) */
  const card = holder.querySelector('.card') as HTMLElement;
  const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: '#fff' });

  /* 3. tidy */
  document.body.removeChild(holder);

  /* 4. write PDF (with your 24 px padding so nothing clips) */
  const margin = 24;
  const pdfW = canvas.width / 2 + margin * 2;
  const pdfH = canvas.height / 2 + margin * 2;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [pdfW, pdfH] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, canvas.width / 2, canvas.height / 2);

  return pdf.output('blob');
}


