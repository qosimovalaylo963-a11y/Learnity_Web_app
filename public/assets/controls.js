function bindPageControls() {
    document.querySelectorAll('[data-click="toggle-quick-text-edit"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleQuickTextEdit();
        });
    });
    document.querySelectorAll('[data-click="document-logo-file-picker"]').forEach((element) => {
        element.addEventListener('click', () => {
            document.getElementById('logo-file-picker').click();
        });
    });
    document.querySelectorAll('[data-change="handle-custom-logo-upload"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            handleCustomLogoUpload(event);
        });
    });
    document.querySelectorAll('[data-click="toggle-applications-drawer"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleApplicationsDrawer(true);
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-apply"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            setRegistrationTab('apply');
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-invite"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            setRegistrationTab('invite');
            document
                .getElementById('apply-card')
                .scrollIntoView({ behavior: canMove() ? 'smooth' : 'instant' });
        });
    });
    document.querySelectorAll('[data-click="open-active-role-workspace"]').forEach((element) => {
        element.addEventListener('click', () => {
            openActiveRoleWorkspace();
        });
    });
    document.querySelectorAll('[data-click="open-auth-modal-login"]').forEach((element) => {
        element.addEventListener('click', () => {
            openAuthModal('login');
        });
    });
    document.querySelectorAll('[data-click="toggle-mobile-nav"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleMobileNav();
        });
    });
    document.querySelectorAll('[data-click="set-registration-tab-apply"]').forEach((element) => {
        element.addEventListener('click', () => {
            setRegistrationTab('apply');
        });
    });
    document.querySelectorAll('[data-pointerdown="start-photo-pan-hero"]').forEach((element) => {
        element.addEventListener('pointerdown', (event) => {
            startPhotoPan(event, 'hero');
        });
    });
    document.querySelectorAll('[data-click="document-hero-photo-input"]').forEach((element) => {
        element.addEventListener('click', () => {
            document.getElementById('hero-photo-input').click();
        });
    });
    document.querySelectorAll('[data-change="replace-hero-photo"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            replaceHeroPhoto(event);
        });
    });
    document.querySelectorAll('[data-click="set-registration-tab-invite"]').forEach((element) => {
        element.addEventListener('click', () => {
            setRegistrationTab('invite');
        });
    });
    document.querySelectorAll('[data-submit="submit-cohort-application"]').forEach((element) => {
        element.addEventListener('submit', submitOnce(submitCohortApplication));
    });
    document.querySelectorAll('[data-change="update-role-application-hint"]').forEach((element) => {
        element.addEventListener('change', () => {
            updateRoleApplicationHint();
        });
    });
    document.querySelectorAll('[data-submit="submit-invitation-registration"]').forEach((element) => {
        element.addEventListener('submit', submitOnce(submitInvitationRegistration));
    });
    document.querySelectorAll('[data-click="fill-demo-invite-code"]').forEach((element) => {
        element.addEventListener('click', () => {
            fillDemoInviteCode();
        });
    });
    document.querySelectorAll('[data-click="verify-entered-invite-code"]').forEach((element) => {
        element.addEventListener('click', () => {
            verifyEnteredInviteCode();
        });
    });
    document.querySelectorAll('[data-click="add-new-lesson-photo-card"]').forEach((element) => {
        element.addEventListener('click', () => {
            addNewLessonPhotoCard();
        });
    });
    document.querySelectorAll('[data-click="select-timeline-stage"]').forEach((element) => {
        element.addEventListener('click', () => {
            selectTimelineStage(0);
        });
    });
    document.querySelectorAll('[data-click="select-timeline-stage-23"]').forEach((element) => {
        element.addEventListener('click', () => {
            selectTimelineStage(1);
        });
    });
    document.querySelectorAll('[data-click="select-timeline-stage-24"]').forEach((element) => {
        element.addEventListener('click', () => {
            selectTimelineStage(2);
        });
    });
    document.querySelectorAll('[data-click="select-timeline-stage-25"]').forEach((element) => {
        element.addEventListener('click', () => {
            selectTimelineStage(3);
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-staff"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('staff');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources-all"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('all');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources-pdf"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('pdf');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources-presentation"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('presentation');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources-youtube"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('youtube');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources-link"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('link');
        });
    });
    document.querySelectorAll('[data-click="filter-subject-resources"]').forEach((element) => {
        element.addEventListener('click', () => {
            filterSubjectResources('study_guide');
        });
    });
    document.querySelectorAll('[data-click="open-resource-modal"]').forEach((element) => {
        element.addEventListener('click', () => {
            openResourceModal();
        });
    });
    document.querySelectorAll('[data-click="trigger-database-backup"]').forEach((element) => {
        element.addEventListener('click', () => {
            triggerDatabaseBackup();
        });
    });
    document.querySelectorAll('[data-click="logout-session"]').forEach((element) => {
        element.addEventListener('click', () => {
            logoutSession();
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-overview"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('overview');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-applications"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('applications');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-invitations"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('invitations');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-members"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('members');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-subjects"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('subjects');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-resources"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('resources');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-media"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('media');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-announcements"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('announcements');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-settings"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('settings');
        });
    });
    document.querySelectorAll('[data-click="open-owner-section-logs"]').forEach((element) => {
        element.addEventListener('click', () => {
            openOwnerSection('logs');
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-apply-46"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            setRegistrationTab('apply');
            document
                .getElementById('apply-card')
                .scrollIntoView({ behavior: canMove() ? 'smooth' : 'instant' });
        });
    });
    document.querySelectorAll('[data-click="toggle-applications-drawer-47"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleApplicationsDrawer(false);
        });
    });
    document.querySelectorAll('[data-click="open-active-role-workspace-48"]').forEach((element) => {
        element.addEventListener('click', () => {
            openActiveRoleWorkspace();
            toggleApplicationsDrawer(false);
        });
    });
    document.querySelectorAll('[data-click="load-applications"]').forEach((element) => {
        element.addEventListener('click', () => {
            loadApplications();
        });
    });
    document.querySelectorAll('[data-click="admin-logout"]').forEach((element) => {
        element.addEventListener('click', () => {
            adminLogout();
        });
    });
    document.querySelectorAll('[data-click="close-ecosystem-modal"]').forEach((element) => {
        element.addEventListener('click', () => {
            closeEcosystemModal();
        });
    });
    document.querySelectorAll('[data-click="toggle-mobile-nav-52"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleMobileNav(false);
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-53"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            toggleMobileNav(false);
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-apply-54"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            setRegistrationTab('apply');
            toggleMobileNav(false);
        });
    });
    document.querySelectorAll('[data-click="switch-ecosystem-view-public-invite-55"]').forEach((element) => {
        element.addEventListener('click', () => {
            switchEcosystemView('public');
            setRegistrationTab('invite');
            toggleMobileNav(false);
        });
    });
    document.querySelectorAll('[data-click="toggle-mobile-nav-login"]').forEach((element) => {
        element.addEventListener('click', () => {
            toggleMobileNav(false);
            openAuthModal('login');
        });
    });
}
