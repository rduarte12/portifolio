import Card from '../components/Card';

export default function Home() {
  return (
    <main className="container">
      
      {/* Introduction */}
      <section className="flex-col gap-sm" style={{ marginTop: '40px', marginBottom: '30px', alignItems: 'center', textAlign: 'center' }}>
        <h1 className="text-serif text-main" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
          Rafael Mendonça Duarte
        </h1>
        <h2 className="text-serif text-muted" style={{ fontSize: '1.05rem', fontWeight: 400 }}>
          Machine Learning Researcher &amp; Information Systems Student
        </h2>
      </section>

      {/* Section Divider */}
      <hr className="divider" />

      {/* About Me */}
      <section style={{ marginBottom: '60px' }}>
        
        <h3 className="title-section text-serif">About Me</h3>
        
        {/* flex-row para computador, mobile-col para empilhar no celular */}
        <div className="flex-row mobile-col gap-lg" style={{ alignItems: 'stretch' }}>
          
          <img style={{ borderRadius: '8px' }}
            
            src="/image.png" 
            alt="Rafael Duarte" 
            className="about-image"
          />
          
          <div className="flex-col gap-md" style={{ flexGrow: 1, justifyContent: 'center' }}>
            <p className="text-muted text-justify">
              I am a <span className="font-bold text-main">Machine Learning Researcher and Information Systems student at University of São Paulo</span> with
              interest in the intersection of Data Science and Software Engineering. My journey in 
              the field of computer science has been driven by a desire to explore cutting-edge 
              technologies and contribute to advancements in artificial intelligence. I am dedicated 
              to continuous learning and actively seek opportunities to apply my skills in real-world 
              projects. At the moment, <span className="font-bold text-main">I am focusing on developing applications for Graph Neural Networks models.</span>
            </p>
            
            <hr className="divider" style={{ margin: '12px 0' }} />
            
            <div className="flex-col gap-sm">
                <p className="text-muted">These are the <strong className="text-main">main technologies</strong> I work with:</p>
                
                {/* Nossas classes utilitárias para as Tags */}
                <div className="flex-row flex-wrap gap-sm">
                    <span className="tag text-main font-bold">Python</span>
                    <span className="tag text-main font-bold">Java</span>
                    <span className="tag text-main font-bold">JavaScript</span>
                    <span className="tag text-main font-bold">Machine Learning</span> 
                    <span className="tag text-main font-bold">Docker</span>
                    <span className="tag text-main font-bold">SQL</span>  
                    <span className="tag text-main font-bold">Cloud Computing</span>
                </div>
            </div>

            <hr className="divider" style={{ margin: '12px 0' }} />
            
            <div className="flex-col gap-md">
                <p className="text-muted">
                    Feel free to check my <span className="font-bold text-main">Cover Letter</span> and <span className="font-bold text-main">Curriculum Vitae</span> for more details about me and my work.
                </p>
                <div className="flex-row flex-wrap gap-md">
                    <a href="https://github.com/rduarte12/portifolio-documents/blob/main/Resum%C3%A9___English_Version.pdf" target="_blank" rel="noopener noreferrer" className="btn">
                        Cover Letter
                    </a>
                    <a href="https://github.com/rduarte12/portifolio-documents/blob/main/Curriculum_Vitae.pdf" target="_blank" rel="noopener noreferrer" className="btn">
                        Curriculum Vitae
                    </a>
                </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="divider" />
      
      {/* Highlights Section */}
      <section style={{ marginBottom: '40px' }}>
        <h3 className="title-section text-serif">Highlights</h3>
        
        <div className="grid-2-cols">
            
            <Card 
                title="The architecture of my Portfolio"
                description="The architecture of my Portfolio, including the technologies used and the design decisions made."
                tags={["Cloud Computing", "React", "AWS"]}
                link="/projects/portfolio"
            />

            <Card 
                title="Predict Churn in the Telco Dataset"
                description="Predict Churn and churn rate of customers in the Telco dataset."
                tags={["Machine Learning", "Data Science"]}
                link="/projects/telco"
            />

            <Card
                title="Graph Neural Networks for Image Classification"
                description="A research project that explores the use of Graph Neural Networks for image classification tasks."
                tags={["Machine Learning", "Graph Neural Networks"]}
                link="/projects/grande"
            />

            <Card
                title="Java Event Planner"
                description="A Java application that allows groups of users to plan and manage events, including scheduling and reminders."
                tags={["Java", "Software Engineering"]}
                link="/projects/java-event-planner"
            />

        </div>
      </section>

    </main>
  );
}