
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';
import type { Package, Voucher } from './definitions';

export async function getPackages(): Promise<Package[]> {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, 'packages'));
    if (snapshot.exists()) {
      const packagesData = snapshot.val();
      
      const packageListPromises = Object.keys(packagesData).map(async (key) => {
        const voucherCountSnapshot = await get(child(dbRef, `vouchers/${key}`));
        const voucherCount = voucherCountSnapshot.exists() ? voucherCountSnapshot.size : 0;
        
        return {
          slug: key,
          ...packagesData[key],
          voucherCount: voucherCount,
        };
      });

      const packageList = await Promise.all(packageListPromises);
      return packageList as Package[];
    } else {
      console.log("No data available for packages");
      return [];
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

export async function getVouchersForPackage(packageSlug: string): Promise<Voucher[]> {
    const dbRef = ref(db, `vouchers/${packageSlug}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const vouchersData = snapshot.val();
            const voucherList = Object.keys(vouchersData).map(key => ({
                id: key,
                ...vouchersData[key]
            }));
            return voucherList as Voucher[];
        } else {
            console.log(`No vouchers found for package: ${packageSlug}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching vouchers for ${packageSlug}:`, error);
        return [];
    }
}
