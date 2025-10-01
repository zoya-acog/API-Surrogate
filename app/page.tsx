import SearchForm from "@/components/SearchForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-2">API surrogate search</h1>
        <p className="text-xl text-center mb-8"></p>
        <SearchForm />
      </div>
    </main>
  )
}
