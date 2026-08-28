import { BASEURL } from './appurls';
import Features from './features.class';
import { mapFeatures } from './features.mapper';

//  ALWAYS initialize with default object
let AppFeatures = new Features();

export async function initFeatures(token) {
  try {
    // console.log("----------",token)
    const res = await fetch(`${BASEURL}/api/core/mobile/sidebar/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    AppFeatures = mapFeatures(data || []);
    // console.log("AppFeatures", AppFeatures);
  } catch (err) {
    // console.error("Feature load failed", err);

    // fallback
    AppFeatures = new Features();
  }

  return AppFeatures;
}

export function getFeatures() {
  return AppFeatures; //  always object
}
