
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';
import type { Package, Voucher } from './definitions';
import { isAfter, addHours, parseISO } from 'date-fns';

export async function getPackages(): Promise<Package[]> {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, 'packages'));
    if (snapshot.exists()) {
      const packagesData = snapshot.val();
      
      const packageListPromises = Object.keys(packagesData).map(async (key) => {
        const voucherSnapshot = await get(child(dbRef, `vouchers/${key}`));
        let availableCount = 0;
        if(voucherSnapshot.exists()) {
          const vouchers = voucherSnapshot.val();
          const packageDuration = packagesData[key].durationHours || 0;

          Object.values(vouchers).forEach((voucher: any) => {
              if (!voucher.usedAt) {
                  availableCount++;
              } else {
                  const usedDate = parseISO(voucher.usedAt);
                  const expiryDate = addHours(usedDate, packageDuration);
                  if (isAfter(new Date(), expiryDate)) {
                      // It's expired, so it could be considered "available" if you resell expired vouchers
                      // For now, we just count non-activated vouchers.
                  } else {
                     // It's active, not available
                  }
              }
          });
        }
        
        return {
          slug: key,
          ...packagesData[key],
          voucherCount: availableCount,
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
    const packageRef = ref(db, `packages/${packageSlug}`);
    const vouchersRef = ref(db, `vouchers/${packageSlug}`);
    try {
        const packageSnapshot = await get(packageRef);
        const vouchersSnapshot = await get(vouchersRef);

        if (!packageSnapshot.exists()) {
            throw new Error(`Package with slug ${packageSlug} not found.`);
        }
        const packageData = packageSnapshot.val() as Omit<Package, 'slug'>;
        const durationHours = packageData.durationHours || 0;

        if (vouchersSnapshot.exists()) {
            const vouchersData = vouchersSnapshot.val();
            const now = new Date();

            const voucherList = Object.keys(vouchersData).map(key => {
                const dbVoucher = vouchersData[key];
                let isUsed = false;
                if (dbVoucher.usedAt) {
                    const usedDate = parseISO(dbVoucher.usedAt);
                    const expiryDate = addHours(usedDate, durationHours);
                    if (isAfter(now, expiryDate)) {
                        // Expired, so considered not "used" in the sense of being active
                        isUsed = false; 
                    } else {
                        // Purchased and currently active
                        isUsed = true;
                    }
                }

                return {
                    id: key,
                    ...dbVoucher,
                    used: isUsed // Dynamically calculated `used` status
                };
            });
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
