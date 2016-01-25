---
layout: post
title:  "shared\_ptr"
date:   2016-01-23
categories: c++ shared_ptr atomic
---

    #include <iostream>
    #include <thread>
    #include <memory>
    #include <chrono>
    #include <atomic>

    using Lock = std::lock_guard<std::mutex>;

    static std::atomic<int> s_test_count(3);
    class Demo;
    using DemoPtr = std::shared_ptr<Demo>;
    class Demo : public std::enable_shared_from_this<Demo>
    {
    public:
        Demo()
        : _testValue(0)
        , _atomicValue(0)
        {
            
        }
        
        ~Demo()
        {
            std::cout << "~Demo()" << std::endl;
        }
        
        void test1()
        {
            std::thread t([this]{
                std::cout << "thead" << std::this_thread::get_id() << " func begin ..." << std::endl;
                std::this_thread::sleep_for(std::chrono::seconds(1));
                {
                    Lock l(_testValueMutex);
                    ++_testValue;
                }
                std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
                
                --s_test_count;
            });
            t.detach();
            {
                Lock l(_testValueMutex);
                ++_testValue;
            }
            std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
        }
        
        void test2()
        {
            {
                auto ptr = shared_from_this();
                std::thread t([this, ptr]{
                    std::cout << "thead" << std::this_thread::get_id() << " func begin ..." << std::endl;
                    std::this_thread::sleep_for(std::chrono::seconds(1));
                    {
                        Lock l(_testValueMutex);
                        ++_testValue;
                    }
                    std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
                    
                    --s_test_count;
                });
                t.detach();
                {
                    Lock l(_testValueMutex);
                    ++_testValue;
                }
                std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
            }
        }
        
        void test3()
        {
            {
                std::thread t(std::bind(&Demo::_theadFunc, this));
                t.detach();
                {
                    Lock l(_testValueMutex);
                    ++_testValue;
                }
                std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
            }
        }
        
        void test4()
        {
            {
                std::thread t(std::bind(&Demo::_theadFunc, shared_from_this()));
                t.detach();
                {
                    Lock l(_testValueMutex);
                    ++_testValue;
                }
                std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
            }
        }

        void test5()
        {
            auto ptr = shared_from_this();
            for (auto j=0; j<20; ++j) {
                std::thread t([this, ptr]{
                    std::this_thread::sleep_for(std::chrono::seconds(1));
                    ++_atomicValue;
                    std::cerr << _testValue << std::endl;
                });
                t.detach();
            }
            while (_atomicValue != 20) {
                std::this_thread::yield();
            }
            --s_test_count;
        }
    private:
        std::mutex _testValueMutex;
        int _testValue;
        std::atomic<int> _atomicValue;
        
        void _theadFunc()
        {
            std::cout << "thead" << std::this_thread::get_id() << " func begin ..." << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(1));
            {
                Lock l(_testValueMutex);
                ++_testValue;
            }
            std::cout << "thread" << std::this_thread::get_id() << ": value=" << _testValue << std::endl;
            
            --s_test_count;
        }
    };

    int main(int argc, const char * argv[]) {
        // insert code here...
        std::cout << "Hello, World!\n";
    //	{
    //		// test 1 crash
    //		auto demoPtr = std::make_shared<Demo>();
    //		std::cout << "Before test1: use_count=" << demoPtr.use_count() << std::endl;
    //		demoPtr->test1();
    //		std::cout << "After test1: use_count=" << demoPtr.use_count() << std::endl;
    //	}
        {
            //test 2
            auto demoPtr = std::make_shared<Demo>();
            std::cout << "Before test2: use_count=" << demoPtr.use_count() << std::endl;
            demoPtr->test2();
            std::cout << "After test2: use_count=" << demoPtr.use_count() << std::endl;
        }
    //	{
    //		//test 3 crash
    //		auto demoPtr = std::make_shared<Demo>();
    //		std::cout << "Before test3: use_count=" << demoPtr.use_count() << std::endl;
    //		demoPtr->test3();
    //		std::cout << "After test3: use_count=" << demoPtr.use_count() << std::endl;
    //	}
        {
            //test 4
            auto demoPtr = std::make_shared<Demo>();
            std::cout << "Before test4: use_count=" << demoPtr.use_count() << std::endl;
            demoPtr->test4();
            std::cout << "After test4: use_count=" << demoPtr.use_count() << std::endl;
        }
        {
            //test 5
            auto demoPtr = std::make_shared<Demo>();
            std::cout << "Before test5: use_count=" << demoPtr.use_count() << std::endl;
            demoPtr->test5();
            std::cout << "After test5: use_count=" << demoPtr.use_count() << std::endl;
        }
        
        while (s_test_count > 0) {
            std::this_thread::yield();
        }
        
        return 0;
    }

