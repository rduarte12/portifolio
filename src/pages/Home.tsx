export default function Home() {
  return (
    <main className="container">
      
      {/* Introduction */}
      <section className="hero-section">
        <h1 className="hero-title">Hello, I am Rafael Duarte!</h1>
        <h2 className="hero-subtitle">Machine Learning Researcher & Information Systems Student</h2>
      </section>

      {/* About Me */}
      <section className="about-section">
        
        <h3 className="about-title" style={{ marginBottom: '8px', marginLeft: '5px', fontWeight: 'bold' }}>
          About Me
        </h3>
        
        <div className="about-content">
          
          <img src="./src/assets/image.png" alt="Rafael Duarte" className="about-image" />
          
          <div className="about-text-content">
            <p className="about-text">
              I am a <span style={{ fontWeight: 'bold' }}>Machine Learning Researcher and Information Systems student</span> with
              interest in the intersection of Data Science and Software Engineering. My journey in 
              the field of computer science has been driven by a desire to explore cutting-edge 
              technologies and contribute to advancements in artificial intelligence. I am dedicated 
              to continuous learning and actively seek opportunities to apply my skills in real-world 
              projects. In the moment, <span style={{ fontWeight: 'bold' }}>I am focusing on developing applications for Graph Neural Networks models.</span>
            </p>

          </div>
        </div>

      </section>

    </main>
  );
}