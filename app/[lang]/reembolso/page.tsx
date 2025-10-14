'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslations } from '@/hooks/useTranslations'

export default function ReembolsoPage() {
  const { lang } = useParams()
  const { t, loading } = useTranslations()

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Refund Policy
          </h1>
          
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-gray-700 mb-6">
              At IQmind, we are committed to providing high-quality cognitive assessment services. 
              This policy clearly and transparently describes our refund terms.
            </p>

            {/* TABLE OF CONTENTS */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li><a href="#overview" className="text-blue-600 hover:underline">Service Overview</a></li>
                <li><a href="#initial-payment" className="text-blue-600 hover:underline">Initial Access Payment (€0.50)</a></li>
                <li><a href="#trial-period" className="text-blue-600 hover:underline">2-Day Trial Period</a></li>
                <li><a href="#premium-subscription" className="text-blue-600 hover:underline">Premium Subscription (€19.99/month)</a></li>
                <li><a href="#refund-process" className="text-blue-600 hover:underline">Refund Request Process</a></li>
                <li><a href="#exceptions" className="text-blue-600 hover:underline">Exceptions and Special Cases</a></li>
                <li><a href="#non-refundable" className="text-blue-600 hover:underline">Non-Refundable Services</a></li>
                <li><a href="#withdrawal-right" className="text-blue-600 hover:underline">Right of Withdrawal (EU)</a></li>
                <li><a href="#contact" className="text-blue-600 hover:underline">Contact Information</a></li>
              </ol>
            </div>

            {/* 1. SERVICE OVERVIEW */}
            <section id="overview" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Service Overview</h2>
              
              <p className="mb-4">IQmind offers intelligence assessment services with the following pricing structure:</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-[#218B8E] font-bold">•</span>
                    <span><strong>Initial payment:</strong> €0.50 for immediate access to test results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#218B8E] font-bold">•</span>
                    <span><strong>Trial period:</strong> 2 days of free premium access (€19.99/month value)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#218B8E] font-bold">•</span>
                    <span><strong>Standard subscription:</strong> €19.99/month after trial period</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm">
                  <strong>⚠️ Important:</strong> By making the initial €0.50 payment, you agree that the 2-day premium 
                  trial period will be automatically activated. If you do not cancel before the trial ends, you will be 
                  automatically charged €19.99/month.
                </p>
              </div>
            </section>

            {/* 2. INITIAL PAYMENT */}
            <section id="initial-payment" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Initial Access Payment (€0.50)</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Refund Policy</h3>
              <p className="mb-4">
                The initial €0.50 payment grants you immediate access to your complete IQ test results. 
                This is a <strong>purchase of digital content</strong> provided instantly.
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="font-semibold mb-2">✅ Eligible for refund if:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>There was a <strong>technical error</strong> preventing access to results</li>
                  <li>A verifiable <strong>duplicate charge</strong> occurred</li>
                  <li>You could not <strong>access the content</strong> due to platform issues</li>
                  <li>Request is made within the <strong>first 24 hours</strong> of payment</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="font-semibold mb-2">❌ NOT eligible for refund if:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>You have already <strong>accessed and viewed</strong> your complete test results</li>
                  <li>You have <strong>downloaded the PDF certificate</strong></li>
                  <li>More than <strong>24 hours</strong> have passed since initial payment</li>
                  <li>You simply changed your mind after viewing the results</li>
                </ul>
              </div>
            </section>

            {/* 3. TRIAL PERIOD */}
            <section id="trial-period" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 2-Day Trial Period</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 How the Trial Works</h3>
              <p className="mb-4">
                When you make the initial €0.50 payment, a <strong>completely free</strong> 2-day premium trial 
                (48 hours from payment) is automatically activated.
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <h4 className="font-bold mb-3">During the trial period:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600">✓</span>
                    <span>Full access to all premium features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600">✓</span>
                    <span>You can <strong>cancel anytime</strong> without additional charges</span>
                </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600">✓</span>
                    <span>If you cancel within 48 hours, <strong>no further charges</strong></span>
                </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600">✓</span>
                    <span>Access to unlimited tests and advanced analytics</span>
                </li>
              </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Trial Period Refunds</h3>
              <p className="mb-4">
                <strong>The trial period itself is FREE,</strong> so there are no charges to refund during this time. 
                However, please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>The initial €0.50 payment follows the refund policy outlined in section 2</li>
                <li>To avoid monthly charges, you must cancel before the trial ends</li>
                <li>Cancellation is simple and can be done anytime from your account</li>
              </ul>
            </section>

            {/* 4. PREMIUM SUBSCRIPTION */}
            <section id="premium-subscription" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Premium Subscription (€19.99/month)</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Subscription Activation</h3>
              <p className="mb-4">
                If you do not cancel during the 2-day trial, the subscription will automatically activate, and you will 
                be charged €19.99/month on a recurring basis.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Monthly Subscription Refunds</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <p className="mb-4"><strong>Refund Policy for Monthly Payments:</strong></p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Full refund</strong> if you request within <strong>48 hours</strong> of the charge and have not 
                      used premium features during that billing period
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-600 font-bold">◐</span>
                    <div>
                      <strong>Partial refund</strong> may be considered for technical issues or billing errors
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <div>
                      <strong>No refund</strong> after 48 hours or if you have actively used premium features
                    </div>
                  </li>
              </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 How to Cancel</h3>
              <p className="mb-4">You can cancel your subscription anytime:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>From your <strong>Account Settings</strong> on the website</li>
                <li>By contacting us at <a href="mailto:support@iqmind.io" className="text-blue-600 underline">support@iqmind.io</a></li>
                <li>Through our <a href={`/${lang}/contacto`} className="text-blue-600 underline">contact page</a></li>
              </ul>
            </section>

            {/* 5. REFUND PROCESS */}
            <section id="refund-process" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Request Process</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 How to Request a Refund</h3>
              <ol className="list-decimal pl-6 space-y-3 mb-4">
                <li>
                  <strong>Contact us</strong> at <a href="mailto:support@iqmind.io" className="text-blue-600 underline">support@iqmind.io</a> or 
                  through our <a href={`/${lang}/contacto`} className="text-blue-600 underline">contact form</a>
                </li>
                <li>Provide your <strong>email address</strong> and <strong>order/transaction ID</strong></li>
                <li>Explain the <strong>reason</strong> for your refund request</li>
                <li>Include any relevant <strong>details or screenshots</strong> if applicable</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Processing Time</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Review:</strong> We will review your request within 1-2 business days</li>
                <li><strong>Decision:</strong> You will receive our decision via email</li>
                <li><strong>Processing:</strong> Approved refunds are processed within 5-7 business days</li>
                <li><strong>Refund method:</strong> Refund will be credited to your original payment method</li>
              </ul>
            </section>

            {/* 6. EXCEPTIONS */}
            <section id="exceptions" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exceptions and Special Cases</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Technical Issues</h3>
              <p className="mb-4">
                If you experience technical problems preventing access to your purchase, we will work to resolve the 
                issue or provide a full refund if the problem cannot be fixed.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Billing Errors</h3>
              <p className="mb-4">
                Any verified billing errors (duplicate charges, incorrect amounts) will be promptly refunded in full.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Exceptional Circumstances</h3>
              <p className="mb-4">
                We understand that special situations may arise. Contact us to discuss your specific case, and we will 
                do our best to find a fair solution.
              </p>
            </section>

            {/* 7. NON-REFUNDABLE */}
            <section id="non-refundable" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Non-Refundable Services</h2>
              
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="mb-4"><strong>The following are generally not eligible for refunds:</strong></p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Digital content that has been accessed and consumed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Certificates that have been downloaded</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Subscription months where premium features were actively used</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Requests made outside the specified time windows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span>•</span>
                    <span>Change of mind after consuming the service</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 8. WITHDRAWAL RIGHT (EU) */}
            <section id="withdrawal-right" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Right of Withdrawal (EU)</h2>
              
              <p className="mb-4">
                Under EU consumer protection law, you have the right to withdraw from online purchases within 14 days. 
                However, this right does not apply to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Digital content</strong> delivered immediately after payment (such as instant test results) 
                  if you have expressly consented and acknowledged that you lose your right of withdrawal
                </li>
                <li>
                  <strong>Services fully performed</strong> if performance has begun with your prior express consent
                </li>
              </ul>
              <p className="mb-4">
                By completing your purchase and accessing your test results, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You expressly request immediate delivery of digital content</li>
                <li>You understand that you will lose your right of withdrawal once the content is delivered</li>
              </ul>
            </section>

            {/* 9. CONTACT */}
            <section id="contact" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              
              <p className="mb-4">For refund requests, questions, or concerns:</p>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <strong>Email:</strong>
                    <a href="mailto:support@iqmind.io" className="text-blue-600 underline">support@iqmind.io</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <strong>Contact Form:</strong>
                    <a href={`/${lang}/contacto`} className="text-blue-600 underline">Contact Page</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <strong>Response Time:</strong>
                    <span>We typically respond within 24-48 hours</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SUMMARY BOX */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">📋 Quick Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2 text-green-700">✅ Refundable:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Technical issues within 24h</li>
                    <li>• Duplicate charges</li>
                    <li>• Subscription within 48h (if unused)</li>
                    <li>• Billing errors</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2 text-red-700">❌ Non-refundable:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• After accessing results</li>
                    <li>• Downloaded certificates</li>
                    <li>• Used premium features</li>
                    <li>• Outside time windows</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                  <strong>💡 Pro Tip:</strong> Cancel during the 2-day trial to avoid any monthly charges!
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
