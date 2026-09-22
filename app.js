document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. SETUP INTERSECTION OBSERVER (ANIMASI)
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.1 
    });

    // ==========================================
    // FUNGSI HAMBURGER MENU NAVBAR
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        // Toggle menu saat hamburger diklik
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        // Tutup otomatis menu saat salah satu tautan diklik
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }

    const hiddenElements = document.querySelectorAll('.fade-in');
    hiddenElements.forEach((el) => observer.observe(el));

    // Deklarasi Elemen Modal Global
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');

    // Tutup modal jika klik di luar kotak putihnya
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Event Menutup Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // --- FUNGSI SCROLL TO TOP ---
    window.addEventListener('scroll', () => {
        const scrollBtn = document.getElementById('scrollTopBtn');
        if (!scrollBtn) return;
        
        // Tombol muncul setelah halaman di-scroll sejauh 300px
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // ==========================================
    // 2. FETCH PROJECTS.JSON & HITUNG RASIO
    // ==========================================
    const container = document.getElementById('project-container');
    if (container) {
        fetch('./data/projects.json')
            .then(response => response.json())
            .then(projects => {
                let countTI = 0;
                let countMM = 0;

                projects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'card fade-in';
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

                    // Event Buka Modal Project
                    card.addEventListener('click', () => {
                        window.openModal(project);
                    });

                    container.appendChild(card);
                    observer.observe(card);

                    if (project.type === 'TI') countTI++;
                    else if (project.type === 'MM') countMM++;
                });

                // Kalkulasi Bar Rasio
                const totalProjects = countTI + countMM;
                if (totalProjects > 0) {
                    const percentTI = Math.round((countTI / totalProjects) * 100);
                    const percentMM = Math.round((countMM / totalProjects) * 100);

                    const tiAngka = document.getElementById('ti-angka');
                    const mmAngka = document.getElementById('mm-angka');
                    const tiBar = document.getElementById('ti-bar');
                    const mmBar = document.getElementById('mm-bar');

                    if (tiAngka) tiAngka.innerText = `${percentTI}%`;
                    if (mmAngka) mmAngka.innerText = `${percentMM}%`;
                    if (tiBar) tiBar.style.setProperty('--target', `${percentTI}%`);
                    if (mmBar) mmBar.style.setProperty('--target', `${percentMM}%`);
                }
            })
            .catch(err => console.error('Error load projects:', err));
    }

    // ==========================================
    // 3. FETCH CERTIFICATES.JSON
    // ==========================================
    const certContainer = document.getElementById('cert-container');
    if (certContainer) {
        fetch('./data/certificates.json')
            .then(response => response.json())
            .then(certs => {
                certs.forEach(cert => {
                    const certCard = document.createElement('div');
                    certCard.className = 'cert-card fade-in'; 
                    
                    certCard.innerHTML = `
                        <img src="${cert.thumbnail}" alt="${cert.title}">
                        <div class="cert-info">
                            <h4>${cert.title}</h4>
                            <p>${cert.issuer}</p>
                        </div>
                    `;

                    // Event Buka Modal Sertifikat
                    certCard.addEventListener('click', () => {
                        window.openCertModal(cert);
                    });

                    certContainer.appendChild(certCard);
                    observer.observe(certCard); 
                });
            })
            .catch(err => console.error('Error load sertifikat:', err));
    }

}); // <--- BATAS AKHIR DOMContentLoaded


// =========================================================================
// FUNGSI GLOBAL (DI LUAR DOMContentLoaded AGAR BISA DIPANGGIL DARI HTML)
// =========================================================================

// --- FUNGSI MEMBUKA MODAL PROJECT (MENDUKUNG GRID & CAROUSEL) ---
window.openModal = function(project) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
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
                } else if (media.type === 'tiktok') {
                    // Tampilan khusus vertikal untuk TikTok
                    elementContent = `
                        <iframe src="https://www.tiktok.com/embed/v2/${media.url}" 
                            style="width: 100%; max-width: 325px; height: 580px; border: none; border-radius: 8px; display: block; margin: 0 auto;" 
                            allowfullscreen>
                        </iframe>`;
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
};

// --- FUNGSI MENGGESER SLIDE CAROUSEL ---
window.changeSlide = function(step) {
    const container = document.getElementById('carousel-container');
    if (!container) return;
    
    const totalSlides = parseInt(container.getAttribute('data-total'));
    let currentSlide = parseInt(container.getAttribute('data-current'));
    
    // Sembunyikan foto yang sedang aktif saat ini
    document.getElementById(`slide-${currentSlide}`).classList.remove('active');
    
    // Hitung index foto selanjutnya
    currentSlide = currentSlide + step;
    
    // Logika looping
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    // Tampilkan foto yang baru dan simpan index-nya
    document.getElementById(`slide-${currentSlide}`).classList.add('active');
    container.setAttribute('data-current', currentSlide);
};

// --- FUNGSI MEMBUKA MODAL KHUSUS SERTIFIKAT ---
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

    modal.style.display = 'flex';
};

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

