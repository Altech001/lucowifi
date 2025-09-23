
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';
import type { Package } from './definitions';

export async function getPackages(): Promise<Package[]> {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, 'packages'));
    if (snapshot.exists()) {
      const packagesData = snapshot.val();
      // Convert the object of packages into an array
      const packageList = Object.keys(packagesData).map(key => ({
        slug: key,
        ...packagesData[key]
      }));
      return packageList as Package[];
    } else {
      console.log("No data available");
      return [];
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}
