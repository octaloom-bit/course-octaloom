import Image from "next/image";

const SITE = "https://www.octaloom.com";

export default function Footer() {
  return (
    <footer className="footer" dir="rtl">
      <div className="inner">
        <div className="col brandcol">
          <a className="logo" href={SITE} target="_blank" rel="noopener noreferrer">
            <Image src="/brand/nav-logo.png" alt="OctaLoom" width={130} height={32} />
          </a>
          <p>מחלקת השיווק שלך, רק בלי המחלקה.</p>
          <a className="goodies" href="https://octagoodies.com/" target="_blank" rel="noopener noreferrer">
            <Image src="/brand/octagoodies.png" alt="OctaGoodies" width={54} height={26} />
            <small>כלים ותבניות שיווק</small>
          </a>
        </div>

        <div className="col">
          <h4>החברה</h4>
          <a href={`${SITE}/about-he`} target="_blank" rel="noopener noreferrer">אודות</a>
          <a href={`${SITE}/blog-he`} target="_blank" rel="noopener noreferrer">בלוג</a>
          <a href={`${SITE}/contact-he`} target="_blank" rel="noopener noreferrer">צרו קשר</a>
        </div>

        <div className="col">
          <h4>שירותי לינקדאין</h4>
          <a href={`${SITE}/linkedin-for-organizations-he`} target="_blank" rel="noopener noreferrer">לינקדאין לארגונים</a>
          <a href={`${SITE}/linkedin-for-executives-he`} target="_blank" rel="noopener noreferrer">לינקדאין למייסדים</a>
          <a href={`${SITE}/linkedin-for-solopreneurs-he`} target="_blank" rel="noopener noreferrer">לינקדאין לעצמאים</a>
          <h4 style={{ marginTop: 18 }}>עוד שירותים</h4>
          <a href={`${SITE}/fractional-cmo-he`} target="_blank" rel="noopener noreferrer">Fractional CMO</a>
          <a href={`${SITE}/ai-tools-agents-he`} target="_blank" rel="noopener noreferrer">כלי AI וסוכנים</a>
          <a href={`${SITE}/workshops`} target="_blank" rel="noopener noreferrer">סדנאות</a>
        </div>

        <div className="col">
          <h4>עקבו אחרינו</h4>
          <div className="social">
            <a href="https://www.linkedin.com/in/hanita-yudovski/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/hanita_Y" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/octaloom" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.youtube.com/@Hanita_Octaloom" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://open.spotify.com/show/4XmsthqR7gnj4nf2gL0T7j" target="_blank" rel="noopener noreferrer">Spotify</a>
          </div>
        </div>
      </div>

      <div className="bar">
        <span className="copy-text">© 2026 OctaLoom. כל הזכויות שמורות</span>
        <span className="legal">
          <a href={`${SITE}/privacy-policy-he`} target="_blank" rel="noopener noreferrer">פרטיות</a>
          <a href={`${SITE}/terms-of-service-he`} target="_blank" rel="noopener noreferrer">תנאי שימוש</a>
          <a href={`${SITE}/accessibility-he`} target="_blank" rel="noopener noreferrer">נגישות</a>
        </span>
      </div>
    </footer>
  );
}
