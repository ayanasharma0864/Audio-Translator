// Utility for analyzing the sentiment of translated lyrics
// Does not use any external APIs or libraries

const positiveWords = [
  "love", "dance", "free", "bright", "joy", "alive", "shine", "smile",
  "happy", "beautiful", "hope", "peace", "light", "sweet", "dream",
  "magic", "wonder", "perfect", "good", "better", "best", "great",
  "amazing", "warm", "heart", "soul", "fly", "high", "heaven",
  "glory", "triumph", "win", "strong", "power", "energy", "life",
  "laugh", "fun", "party", "celebrate", "together", "forever"
];

const negativeWords = [
  "pain", "dark", "cry", "break", "alone", "hollow", "bleed", "tear",
  "sad", "sorrow", "hurt", "broken", "lost", "cold", "empty", "fall",
  "die", "death", "end", "fade", "grief", "shadow", "ghost", "lie",
  "fear", "scared", "terrified", "hate", "anger", "rage", "mad",
  "fight", "war", "blood", "kill", "destroy", "ruin", "ash", "dust",
  "nothing", "nobody", "never", "worse", "bad", "evil", "run"
];

const tenseKeywords = ["fight", "run", "fear", "scare", "rage", "anger", "war", "blood", "kill"];

// Computes a sentiment score for the given lines of text
// params: linesArray (array of strings, usually translated english lines)
// returns: {joyful: number, melancholic: number, tense: number, neutral: number}
export function scoreLyrics(linesArray) {
  if (!linesArray || linesArray.length === 0) {
    return { joyful: 0, melancholic: 0, tense: 0, neutral: 100 };
  }

  // Combine into one big string and convert to lowercase for matching
  const fullText = linesArray.join(" ").toLowerCase();
  
  // Extract words
  const words = fullText.match(/\b[a-z]+\b/g) || [];
  const totalWords = words.length;
  
  if (totalWords === 0) {
    return { joyful: 0, melancholic: 0, tense: 0, neutral: 100 };
  }

  let posCount = 0;
  let negCount = 0;
  let tenseKeywordsPresent = false;

  // Count occurrences
  words.forEach(word => {
    if (positiveWords.includes(word)) posCount++;
    if (negativeWords.includes(word)) {
      negCount++;
      if (tenseKeywords.includes(word)) {
        tenseKeywordsPresent = true;
      }
    }
  });

  // Calculate densities as percentages of total matched words
  // Note: a song has many stop words, so total emotional words is small
  // We'll normalize based on the total emotional words found, or a minimum threshold
  const totalEmotional = posCount + negCount;
  
  // If not enough emotional words, it's mostly neutral
  if (totalEmotional < Math.max(5, totalWords * 0.05)) {
    return { joyful: 10, melancholic: 10, tense: 0, neutral: 80 };
  }

  const posDensity = posCount / totalEmotional;
  const negDensity = negCount / totalEmotional;

  let joyful = Math.round(posDensity * 100);
  let melancholic = Math.round(negDensity * 100);
  let tense = 0;
  let neutral = 0;

  // Rule for "Tense": if negative density > 30% and tense keywords are present
  if (negDensity > 0.3 && tenseKeywordsPresent) {
    // Shift some of the melancholic score to tense
    tense = Math.round(melancholic * 0.6);
    melancholic = melancholic - tense;
  }

  // Cap at 100 total
  // Let's ensure they add up to exactly 100
  // Since we normalized over emotional words, let's add a baseline neutral
  // proportional to how many non-emotional words there are
  const emotionalRatio = Math.min(1, totalEmotional / (totalWords * 0.2)); // Assume 20% emotional is max intensity
  
  const intensity = emotionalRatio;
  
  const finalJoyful = Math.round(joyful * intensity);
  const finalMelancholic = Math.round(melancholic * intensity);
  const finalTense = Math.round(tense * intensity);
  const finalNeutral = 100 - (finalJoyful + finalMelancholic + finalTense);

  return {
    joyful: finalJoyful,
    melancholic: finalMelancholic,
    tense: finalTense,
    neutral: finalNeutral
  };
}
