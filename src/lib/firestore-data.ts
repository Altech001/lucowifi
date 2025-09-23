
import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Package } from './definitions';

export async function getPackages(): Promise<Package[]> {
  const packagesCol = collection(db, 'packages');
  const packageSnapshot = await getDocs(packagesCol);
  const packageList = packageSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      slug: data.slug,
      name: data.name,
      price: data.price,
      description: data.description,
      details: data.details,
      imageId: data.imageId,
    } as Package;
  });
  return packageList;
}
