---
layout: home

hero:
  name: EM Notebook
  # tagline: 一箱笔记本。

  # actions:
  #   - theme: brand
  #     text: About
  #     link: /about/

  #   - theme: alt
  #     text: GitHub
  #     link: https://github.com/elecmonkey/elecmonkey-notebook

  #   - theme: alt
  #     text: Elecmonkey的小花园
  #     link: https://www.elecmonkey.com
---

<SubjectCardContainer :columns="3">
  <SubjectCard 
    icon="📐" 
    title="线性代数" 
    details="Linear Algebra" 
    link="/linear-algebra/"
  />
  <SubjectCard 
    icon="🎲" 
    title="概率论与数理统计" 
    details="Probability and Statistics" 
    link="/probability-and-statistics/"
  />
  <SubjectCard 
    icon="🔢" 
    title="高等数学" 
    details="Advanced Mathematics"
    type="pending"
  />
</SubjectCardContainer>

<SubjectCardContainer :columns="4">
  <SubjectCard 
    icon="🖥️" 
    title="操作系统" 
    details="Operating System" 
    link="/operating-systems/"
  />
  <SubjectCard 
    icon="🌳" 
    title="数据结构" 
    details="Data Structure" 
    type="pending"
  />
  <SubjectCard 
    icon="⚙️" 
    title="计算机组成原理" 
    details="Computer Organization"
    type="pending"
  />
  <SubjectCard 
    icon="🌐" 
    title="计算机网络" 
    details="Computer Networking"
    link="/computer-networking/"
    type="progress"
  />
</SubjectCardContainer>

<SubjectCardContainer :columns="3">
  <SubjectCard 
    icon="🧮" 
    title="算法设计与分析" 
    details="Algorithms"
    link="/algorithms/"
  />
  <SubjectCard 
    icon="🗄️" 
    title="数据库原理" 
    details="Database Principles"
    link="https://notes.river177.com/Database/"
  />
  <SubjectCard 
    icon="🔄" 
    title="编译原理" 
    details="Compiler Principles"
    link="/compiler-principles/"
  />
</SubjectCardContainer>