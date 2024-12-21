import { Mail, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import Footer from '@/components/sections/footer'
import Header from '@/components/sections/header'


export default function SupportPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-primary">Need Help?</CardTitle>
            <CardDescription className="text-xl mt-2">
              Contact TradersLab Support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <p className="text-center text-muted-foreground">
              At TradersLab, we are dedicated to ensuring that your experience is seamless and productive.
              If you encounter any issues or have questions, our support team is here to help!
            </p>

            <Separator />

            <h2 className="text-2xl font-semibold text-center">The Best Ways to Reach Us</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6" />
                    Join Our Discord Server
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    For real-time support, community interaction, and quick responses, we highly recommend joining our Discord server.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="https://discord.gg/hznk7WrS">
                    <Button className="w-full" variant="default">
                      Join Discord
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-6 w-6" />
                    Send Us an Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    If Discord isn&#39;t your thing, you can always email us directly. Our team will get back to you as soon as possible.
                  </p>
                </CardContent>
                <CardFooter>
                  <a href="mailto:Support@TradersLab.io"><Button className="w-full" variant="secondary">
                    Email Support
                  </Button>
                  </a>
                </CardFooter>
              </Card>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Why Discord?</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Faster Responses: Get real-time support from our team and fellow traders.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Community Insights: Share ideas, ask questions, and connect with like-minded traders.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Stay Updated: Receive announcements, feature updates, and other important news first.</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">We&#39;re Here for You</h3>
            <p className="text-center text-muted-foreground mb-4">
              Your success is our priority. If you&#39;re stuck, have questions, or simply want to say hello, don&#39;t hesitate to reach out.
            </p>
            <div className="flex gap-4">
              <Link href="https://discord.gg/hznk7WrS"><Button variant="outline">Join Our Discord</Button></Link>
              <a href="mailto:Support@TradersLab.io"><Button variant="outline">Email Us</Button></a>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>)

}
