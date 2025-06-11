/**
 * Splits a message into chunks to avoid Discord's 2000 character limit
 * @param message The message to split
 * @param maxLength Maximum length per chunk (default: 2000)
 * @returns Array of message chunks
 */
export function splitMessage(message: string, maxLength = 2000): string[] {
  const chunks = [];
  while (message.length > maxLength) {
    let sliceIndex = message.lastIndexOf('\n', maxLength); // tenta cortar no final da última linha
    if (sliceIndex === -1) sliceIndex = maxLength;
    chunks.push(message.slice(0, sliceIndex));
    message = message.slice(sliceIndex);
  }
  if (message.length > 0) chunks.push(message);
  return chunks;
}
