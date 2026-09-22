document.addEventListener('DOMContentLoaded', () => {
    // 1. SETUP INTERSECTION OBSERVER
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Opsional: Hapus komentar di bawah ini jika kamu ingin animasinya 
                // hanya jalan 1 kali saja (tidak berulang kalau di-scroll ke atas lagi)
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // Animasi mulai saat 10% bagian elemen sudah terlihat di layar
    });

    // 2. PANTAU SEMUA ELEMEN HTML STATIS YANG PUNYA CLASS 'fade-in'
    const hiddenElements = document.querySelectorAll('.fade-in');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- Sisa kode lama kamu ---
    const container = document.getElementById('project-container');
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('close-modal');

    fetch('./data/projects.json')
        .then(response => response.json())
        .then(projects => {
            let countTI = 0;
            let countMM = 0;

            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'card';
                const toolsString = project.tools.join(', ');

                card.innerHTML = `
                    <img src="${project.image}" alt="${project.title}">
                    <div class="card-content">
                        <span class="category">${project.category}</span>
                        <h3>${project.title}</h3>
                        <div class="tools">Tools: ${toolsString}</div>
                        <p>${project.description}</p>
                    </div>
                `;

                // --- EVENT KETIKA KARTU DIKLIK ---
                card.addEventListener('click', () => {
                    openModal(project);
                });

                container.appendChild(card);

                // Hitung Rasio
                if (project.type === 'TI') countTI++;
                else if (project.type === 'MM') countMM++;
            });

            // Kalkulasi Bar Rasio (Sama seperti sebelumnya)
            const totalProjects = countTI + countMM;
            if (totalProjects > 0) {
                const percentTI = Math.round((countTI / totalProjects) * 100);
                const percentMM = Math.round((countMM / totalProjects) * 100);

                document.getElementById('ti-angka').innerText = `${percentTI}%`;
                document.getElementById('mm-angka').innerText = `${percentMM}%`;
                document.getElementById('ti-bar').style.setProperty('--target', `${percentTI}%`);
                document.getElementById('mm-bar').style.setProperty('--target', `${percentMM}%`);
            }
        });

    // --- FUNGSI MEMBUKA MODAL ---
    // --- FUNGSI MEMBUKA MODAL PROJECT ---
    function openModal(project) {
        const toolsString = project.tools.join(', ');
        
        let mediaHTML = '';
        
        // Pastikan mediaList ada
        if (project.detail && project.detail.mediaList && project.detail.mediaList.length > 0) {
            
            // Cek gaya layout yang diminta dari JSON (default ke 'grid' jika tidak ada)
            const layoutStyle = project.detail.layoutStyle || 'grid';

            if (layoutStyle === 'carousel') {
                // --- LOGIKA LAYOUT CAROUSEL / SLIDER ---
                let slidesHTML = '';
                project.detail.mediaList.forEach((media, index) => {
                    let activeClass = (index === 0) ? 'active' : '';
                    let elementContent = '';

                    if (media.type === 'image') {
                        elementContent = `<img src="${media.url}" alt="${media.caption}">`;
                    } else if (media.type === 'video') {
                        elementContent = `<iframe src="${media.url}" frameborder="0" allowfullscreen></iframe>`;
                    }

                    slidesHTML += `
                        <div class="carousel-slide ${activeClass}" id="slide-${index}">
                            ${elementContent}
                            <div class="carousel-caption">
                                <strong>${index + 1} / ${project.detail.mediaList.length}</strong> - ${media.caption}
                            </div>
                        </div>
                    `;
                });

                let navButtons = '';
                if (project.detail.mediaList.length > 1) {
                    navButtons = `
                        <button class="carousel-prev" onclick="changeSlide(-1)">&#10094;</button>
                        <button class="carousel-next" onclick="changeSlide(1)">&#10095;</button>
                    `;
                }

                mediaHTML = `
                    <h3 style="margin-top: 20px; color: #2c3e50;">Galeri & Dokumentasi:</h3>
                    <div class="carousel-container" id="carousel-container" data-total="${project.detail.mediaList.length}" data-current="0">
                        ${slidesHTML}
                        ${navButtons}
                    </div>
                `;

            } else {
                // --- LOGIKA LAYOUT GRID BIASA (DIJEJER) ---
                let gridHTML = '';
                project.detail.mediaList.forEach(media => {
                    let elementContent = '';
                    if (media.type === 'image') {
                        elementContent = `
                            <div class="media-container">
                                <img src="${media.url}" alt="${media.caption}">
                                <a href="${media.url}" target="_blank" class="fullsize-btn">Lihat Fullsize</a>
                            </div>
                        `;
                    } else if (media.type === 'video') {
                        elementContent = `<iframe src="${media.url}" frameborder="0" allowfullscreen></iframe>`;
                    }

                    gridHTML += `
                        <div class="media-item">
                            ${elementContent}
                            <div class="media-caption">${media.caption}</div>
                        </div>
                    `;
                });

                mediaHTML = `
                    <h3 style="margin-top: 20px; color: #2c3e50;">Galeri & Dokumentasi Program:</h3>
                    <div class="modal-gallery-grid">
                        ${gridHTML}
                    </div>
                `;
            }
        }

        // Masukkan data ke dalam modal body
        modalBody.innerHTML = `
            <span class="modal-category">${project.category}</span>
            <h2 class="modal-title">${project.title}</h2>
            <div class="tools" style="margin-bottom: 15px;">Tools: ${toolsString}</div>
            <p class="modal-description">${project.detail ? project.detail.fullDescription : project.description}</p>
            ${mediaHTML}
        `;

        modal.style.display = 'flex';
    }

    // --- FUNGSI MENUTUP MODAL ---
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

// --- MEMUAT DATA SERTIFIKAT ---
    const certContainer = document.getElementById('cert-container');

    fetch('./data/certificates.json')
        .then(response => response.json())
        .then(certs => {
            certs.forEach(cert => {
                const certCard = document.createElement('div');
                // Tambahkan class 'fade-in' agar animasi scroll-nya ikut berfungsi
                certCard.className = 'cert-card fade-in'; 
                
                certCard.innerHTML = `
                    <img src="${cert.thumbnail}" alt="${cert.title}">
                    <div class="cert-info">
                        <h4>${cert.title}</h4>
                        <p>${cert.issuer}</p>
                    </div>
                `;

                // Event ketika kartu diklik
                certCard.addEventListener('click', () => {
                    openCertModal(cert);
                });

                certContainer.appendChild(certCard);
                observer.observe(certCard); // Daftarkan ke observer animasi
            });
        })
        .catch(err => console.error('Error load sertifikat:', err));

    // --- FUNGSI MEMBUKA MODAL KHUSUS SERTIFIKAT (VERSI JSON) ---
    window.openCertModal = function(cert) {
        const modal = document.getElementById('project-modal');
        const modalBody = document.getElementById('modal-body');

        let imagesHTML = '';

        // Lakukan perulangan untuk setiap detail (gambar + note)
        cert.details.forEach(item => {
            imagesHTML += `
                <div class="media-item" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 0; margin-bottom: 25px; border-radius: 8px; overflow: hidden;">
                    <div class="media-container" style="justify-content: center; background: #f1f2f6; padding: 15px;">
                        <img src="${item.image}" alt="${cert.title}" style="max-height: 70vh; width: 100%; object-fit: contain; background: transparent;">
                        <a href="${item.image}" target="_blank" class="fullsize-btn">Buka Fullsize</a>
                    </div>
                    <!-- Bagian ini khusus untuk menampilkan text Note/Catatan -->
                    <div style="background: #ffffff; padding: 12px 15px; text-align: center; font-size: 0.95rem; color: #444; font-weight: 600; border-top: 1px solid #e0e0e0;">
                        ${item.note}
                    </div>
                </div>
            `;
        });

        // Masukkan susunan HTML ke dalam modal
        modalBody.innerHTML = `
            <span class="modal-category">${cert.issuer}</span>
            <h2 class="modal-title" style="margin-bottom: 20px;">${cert.title}</h2>
            <div class="cert-gallery" style="display: flex; flex-direction: column;">
                ${imagesHTML}
            </div>
        `;

        // Tampilkan Modal
        modal.style.display = 'flex';
    };

    // Tutup modal jika klik di luar kotak putihnya
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});