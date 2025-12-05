// Verify menu fixes
const API_URL = 'https://gourmet-bites.vercel.app/api/menu';

async function verify() {
    const response = await fetch(API_URL);
    const items = await response.json();

    const poop = items.find(i => i.id === 20);
    const sushi = items.find(i => i.id === 6);

    console.log('=== Verification Results ===');
    console.log('Poop item (ID 20) exists:', poop ? '❌ YES (should be deleted)' : '✅ NO (deleted successfully)');
    console.log('\nSpicy Tuna Roll (ID 6):');
    console.log('- Image:', sushi?.image);
    console.log('- Expected: https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800');
    console.log('- Match:', sushi?.image === 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800' ? '✅ YES' : '❌ NO');
}

verify();
