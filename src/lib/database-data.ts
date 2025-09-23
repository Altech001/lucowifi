

import { db } from './firebase';
import { ref, get, child } from 'firebase/database';
import type { Package, Voucher, Membership } from './definitions';
import { isAfter, addHours, parseISO, formatDistanceToNow, format } from 'date-fns';

export async function getPackages(): Promise<Package[]> {
  const dbRef = ref(db);
  let packageList: Package[] = [];
  try {
    const snapshot = await get(child(dbRef, 'packages'));
    if (snapshot.exists()) {
      const packagesData = snapshot.val();
      
      const packageListPromises = Object.keys(packagesData).map(async (key) => {
        const voucherSnapshot = await get(child(dbRef, `vouchers/${key}`));
        let availableCount = 0;
        if(voucherSnapshot.exists()) {
          const vouchers = voucherSnapshot.val();
          Object.values(vouchers).forEach((voucher: any) => {
              // Only count vouchers that have never been used
              if (!voucher.usedAt) {
                  availableCount++;
              }
          });
        }
        
        return {
          slug: key,
          ...packagesData[key],
          voucherCount: availableCount,
        };
      });

      packageList = await Promise.all(packageListPromises);
    } else {
      console.log("No data available for packages");
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
  }

  // Statically add the monthly membership package
  const membershipPackage: Package = {
    slug: 'monthly-membership',
    name: 'Monthly Membership',
    price: 30000,
    description: 'Unlimited access for a whole month.',
    details: ['Unlimited high-speed internet', '24/7 support'],
    imageId: 'gold-package', 
    durationHours: 24 * 30, // Approx 30 days
  };

  return [...packageList, membershipPackage];
}

export function getVoucherStatus(voucher: Voucher | { usedAt?: string }, durationHours: number): { status: 'Active' | 'Expired' | 'Available', expiry: string | null } {
    if (voucher.usedAt) {
        const usedDate = parseISO(voucher.usedAt);
        const expiryDate = addHours(usedDate, durationHours);
        if (isAfter(new Date(), expiryDate)) {
            return { status: 'Expired', expiry: format(expiryDate, "dd MMM yyyy, HH:mm") };
        } else {
            return { status: 'Active', expiry: formatDistanceToNow(expiryDate, { addSuffix: true }) };
        }
    }
    return { status: 'Available', expiry: null };
}

export async function getVouchersForPackage(packageSlug: string): Promise<Voucher[]> {
    const packageRef = ref(db, `packages/${packageSlug}`);
    const vouchersRef = ref(db, `vouchers/${packageSlug}`);
    try {
        const packageSnapshot = await get(packageRef);
        if (!packageSnapshot.exists()) {
            throw new Error(`Package with slug ${packageSlug} not found.`);
        }
        const packageData = packageSnapshot.val() as Omit<Package, 'slug'>;
        
        const vouchersSnapshot = await get(vouchersRef);
        if (vouchersSnapshot.exists()) {
            const vouchersData = vouchersSnapshot.val();

            const voucherList = Object.keys(vouchersData).map(key => {
                const dbVoucher = vouchersData[key];
                const { status } = getVoucherStatus(dbVoucher, packageData.durationHours);
                
                return {
                    id: key,
                    ...dbVoucher,
                    status: status, // Dynamic status
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

// New function to get all vouchers with their package info
export async function getAllVouchersWithPackageInfo(): Promise<(Voucher & { packageName: string, packageDurationHours: number })[]> {
    const dbRef = ref(db);
    try {
        const packagesSnapshot = await get(child(dbRef, 'packages'));
        const vouchersSnapshot = await get(child(dbRef, 'vouchers'));

        if (!packagesSnapshot.exists() || !vouchersSnapshot.exists()) {
            return [];
        }

        const packages = packagesSnapshot.val();
        const allVouchersByPackage = vouchersSnapshot.val();
        const result: (Voucher & { packageName: string, packageDurationHours: number })[] = [];

        for (const packageSlug in allVouchersByPackage) {
            if (packages[packageSlug]) {
                const packageInfo = packages[packageSlug];
                const vouchersForPackage = allVouchersByPackage[packageSlug];
                for (const voucherId in vouchersForPackage) {
                    result.push({
                        id: voucherId,
                        ...vouchersForPackage[voucherId],
                        packageName: packageInfo.name,
                        packageDurationHours: packageInfo.durationHours,
                    });
                }
            }
        }
        return result;

    } catch (error) {
        console.error("Error fetching all vouchers:", error);
        return [];
    }
}

export async function getMemberships(): Promise<Membership[]> {
    const dbRef = ref(db, 'memberships');
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const membershipsData = snapshot.val();
            const membershipList: Membership[] = Object.keys(membershipsData).map(key => ({
                id: key,
                ...membershipsData[key],
            }));
            return membershipList;
        }
        return [];
    } catch (error) {
        console.error("Error fetching memberships:", error);
        return [];
    }
}
