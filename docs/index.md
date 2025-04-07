---
layout: home

hero:
  name: EM Notebook
  tagline: 一箱笔记本。

  actions:
    - theme: brand
      text: About
      link: /about/

    - theme: alt
      text: GitHub
      link: https://github.com/elecmonkey/elecmonkey-notebook

    - theme: alt
      text: Elecmonkey的小花园
      link: https://www.elecmonkey.com
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
    type="progress"
  />
  <SubjectCard 
    icon="🔢" 
    title="高等数学" 
    details="Advanced Mathematics"
    type="pending"
  />
</SubjectCardContainer>

<!-- <SubjectCardContainer :columns="4">
  <SubjectCard 
    icon="🖥️" 
    title="操作系统" 
    details="Operating System" 
    type="pending"
  />
  <SubjectCard 
    icon="🌳" 
    title="数据结构" 
    details="Data Structure" 
  />
  <SubjectCard 
    icon="⚙️" 
    title="计算机组成原理" 
    details="Computer Organization"
  />
  <SubjectCard 
    icon="🖥️" 
    title="计算机网络" 
    details="Computer Networking"
  />
</SubjectCardContainer> -->

<SubjectCardContainer :columns="1">
  <SubjectCard 
    icon="🧮" 
    title="算法设计与分析" 
    details="Algorithms" 
    type="progress"
  />
  <!-- <SubjectCard 
    icon="🌐" 
    title="计算机网络" 
    details="Computer Networking" 
  />
  <SubjectCard 
    icon="🏗️" 
    title="软件体系与结构设计" 
    details="Software Architecture"
  />
  <SubjectCard 
    icon="🤖" 
    title="机器学习" 
    details="Machine Learning"
  /> -->
</SubjectCardContainer>