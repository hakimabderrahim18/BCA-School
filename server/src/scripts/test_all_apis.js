const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

const run = async () => {
  const results = [];
  const log = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${detail ? '(' + detail + ')' : ''}`);
  };

  try {
    // 1. Health
    const resHealth = await fetch(`${BASE_URL}/health`);
    const jsonHealth = await resHealth.json();
    log('GET /health', resHealth.status === 200 && jsonHealth.success);

    // 2. Login with Email
    const resLoginEmail = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@bca-tiaret.dz',
        password: 'AdminSecurePass2026!',
      }),
    });
    const jsonLoginEmail = await resLoginEmail.json();
    authToken = jsonLoginEmail.data?.accessToken;
    log('POST /auth/login (Email)', resLoginEmail.status === 200 && !!authToken);

    // 3. Login with Phone Number
    const resLoginPhone = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '0550000000',
        password: 'AdminSecurePass2026!',
      }),
    });
    const jsonLoginPhone = await resLoginPhone.json();
    log('POST /auth/login (Phone)', resLoginPhone.status === 200 && jsonLoginPhone.success);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    // 4. GET /auth/me
    const resMe = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const jsonMe = await resMe.json();
    log('GET /auth/me', resMe.status === 200 && jsonMe.data?.user?.email === 'admin@bca-tiaret.dz');

    // 5. GET /dashboard/stats
    const resDash = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders });
    const jsonDash = await resDash.json();
    log('GET /dashboard/stats', resDash.status === 200 && !!jsonDash.data?.counts);

    // 6. GET /users
    const resUsers = await fetch(`${BASE_URL}/users`, { headers: authHeaders });
    const jsonUsers = await resUsers.json();
    log('GET /users', resUsers.status === 200 && Array.isArray(jsonUsers.data));

    // 7. GET /categories
    const resCats = await fetch(`${BASE_URL}/categories`);
    const jsonCats = await resCats.json();
    const categories = jsonCats.data || [];
    log('GET /categories', resCats.status === 200 && categories.length > 0);

    const formationCatId = categories.find((c) => c.type === 'formation')?._id || categories[0]?._id;
    const prestationCatId = categories.find((c) => c.type === 'prestation')?._id || categories[0]?._id;

    // 8. GET /formations
    const resFormations = await fetch(`${BASE_URL}/formations`);
    const jsonFormations = await resFormations.json();
    log('GET /formations', resFormations.status === 200 && Array.isArray(jsonFormations.data));

    // 9. POST /formations (Create Test Formation)
    const resCreateForm = await fetch(`${BASE_URL}/formations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Formation Test Automatisée ' + Date.now(),
        category: formationCatId,
        shortDescription: 'Résumé test automatisé pour vérifier la création',
        duration: '20 heures',
        price: '15000',
        targetAudience: 'Étudiants, Développeurs',
        prerequisites: 'Bases en informatique',
        objectives: ['Comprendre les concepts', 'Pratiquer en atelier'],
        program: [{ moduleNumber: 1, title: 'Introduction', description: 'Concepts clés' }],
        instructorName: 'Formateur Test',
        isActive: true,
      }),
    });
    const jsonCreateForm = await resCreateForm.json();
    const createdFormId = jsonCreateForm.data?._id;
    log('POST /formations (Create)', resCreateForm.status === 201 && !!createdFormId, jsonCreateForm.message);

    // 10. PUT /formations/:id (Update Test Formation)
    if (createdFormId) {
      const resUpdateForm = await fetch(`${BASE_URL}/formations/${createdFormId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Formation Test Modifiée ' + Date.now(),
          shortDescription: 'Nouveau résumé mis à jour avec succès',
          price: '18000',
          isActive: true,
        }),
      });
      const jsonUpdateForm = await resUpdateForm.json();
      log('PUT /formations/:id (Update)', resUpdateForm.status === 200 && jsonUpdateForm.data?.price === 18000);

      // 11. DELETE /formations/:id (Delete Test Formation)
      const resDelForm = await fetch(`${BASE_URL}/formations/${createdFormId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      log('DELETE /formations/:id (Delete)', resDelForm.status === 200);
    }

    // 12. GET /prestations
    const resPrest = await fetch(`${BASE_URL}/prestations`);
    const jsonPrest = await resPrest.json();
    log('GET /prestations', resPrest.status === 200 && Array.isArray(jsonPrest.data));

    // 13. POST /prestations (Create Test Prestation)
    const resCreatePrest = await fetch(`${BASE_URL}/prestations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Prestation Test Automatisée ' + Date.now(),
        category: prestationCatId,
        shortDescription: 'Résumé prestation test automatisé',
        description: 'Description complète du service de communication',
        delay: '3 jours',
        startingPrice: 25000,
        benefits: ['Livrables HD', 'Support 7j/7'],
        steps: [{ stepNumber: 1, title: 'Cahier des charges', description: '' }],
        isActive: true,
      }),
    });
    const jsonCreatePrest = await resCreatePrest.json();
    const createdPrestId = jsonCreatePrest.data?._id;
    log('POST /prestations (Create)', resCreatePrest.status === 201 && !!createdPrestId, jsonCreatePrest.message);

    // 14. PUT /prestations/:id (Update Test Prestation)
    if (createdPrestId) {
      const resUpdatePrest = await fetch(`${BASE_URL}/prestations/${createdPrestId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Prestation Test Modifiée ' + Date.now(),
          shortDescription: 'Résumé modifié',
          startingPrice: 30000,
        }),
      });
      const jsonUpdatePrest = await resUpdatePrest.json();
      log('PUT /prestations/:id (Update)', resUpdatePrest.status === 200);

      // 15. DELETE /prestations/:id
      const resDelPrest = await fetch(`${BASE_URL}/prestations/${createdPrestId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      log('DELETE /prestations/:id (Delete)', resDelPrest.status === 200);
    }

    // 16. GET /articles
    const resArticles = await fetch(`${BASE_URL}/articles`);
    const jsonArticles = await resArticles.json();
    log('GET /articles', resArticles.status === 200 && Array.isArray(jsonArticles.data));

    // 17. GET /events
    const resEvents = await fetch(`${BASE_URL}/events`);
    const jsonEvents = await resEvents.json();
    log('GET /events', resEvents.status === 200 && Array.isArray(jsonEvents.data));

    // 18. GET /annonceurs
    const resAnnonceurs = await fetch(`${BASE_URL}/annonceurs`);
    const jsonAnnonceurs = await resAnnonceurs.json();
    log('GET /annonceurs', resAnnonceurs.status === 200 && Array.isArray(jsonAnnonceurs.data));

    // 19. GET /ads
    const resAds = await fetch(`${BASE_URL}/ads`);
    const jsonAds = await resAds.json();
    log('GET /ads', resAds.status === 200);

    // 20. GET /gallery
    const resGallery = await fetch(`${BASE_URL}/gallery`);
    const jsonGallery = await resGallery.json();
    log('GET /gallery', resGallery.status === 200);

    // 21. GET /contact/messages
    const resMsgs = await fetch(`${BASE_URL}/contact/messages`, { headers: authHeaders });
    const jsonMsgs = await resMsgs.json();
    log('GET /contact/messages', resMsgs.status === 200);

    // 22. GET /contact/testimonials
    const resTestimonials = await fetch(`${BASE_URL}/contact/testimonials`);
    log('GET /contact/testimonials', resTestimonials.status === 200);

    // 23. GET /contact/partners
    const resPartners = await fetch(`${BASE_URL}/contact/partners`);
    log('GET /contact/partners', resPartners.status === 200);

    // 24. GET /settings
    const resSettings = await fetch(`${BASE_URL}/settings`);
    log('GET /settings', resSettings.status === 200);

    console.log('\n--- RAPPORT FINAL DES TESTS API ---');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`Total: ${results.length} | Succès: ${passedCount} | Échecs: ${results.length - passedCount}`);
  } catch (err) {
    console.error('Erreur exécution test:', err);
  }
};

run();
