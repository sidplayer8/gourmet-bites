// Fix menu item images
const API_URL = 'https://gourmet-bites.vercel.app/api/menu/manage';

async function fixMenuItems() {
    try {
        // 1. Delete the "Poop" test item (ID 20)
        console.log('Deleting "Poop" test item...');
        const deleteResponse = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 20 })
        });

        if (deleteResponse.ok) {
            console.log('✅ Deleted "Poop" item');
        } else {
            console.log('⚠️  Failed to delete "Poop" item:', await deleteResponse.text());
        }

        // 2. Update Spicy Tuna Roll with a working image
        console.log('\nUpdating Spicy Tuna Roll image...');
        const updateResponse = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 6,
                name: 'Spicy Tuna Roll',
                description: 'Tuna roll with spicy mayo and sesame seeds',
                price: 11.99,
                category: 'Sushi',
                image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
                allergens: ['Fish', 'Sesame']
            })
        });

        if (updateResponse.ok) {
            console.log('✅ Updated Spicy Tuna Roll image');
        } else {
            console.log('⚠️  Failed to update Spicy Tuna Roll:', await updateResponse.text());
        }

        console.log('\n✅ All fixes completed!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixMenuItems();
